const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const { sendMessage } = require('./whatsappService');
const { handleFlow, userSessions } = require('./botFlow');
const { startWA, getQRCode } = require('./waSession');
const path = require('path');
const { sendContatoMail } = require('./contatoMailer');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const helmet = require('helmet');
// Autenticação agora é feita apenas pelo Supabase
require('dotenv').config();


const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
// app.use('/api/auth/social', authSocial); // Removido: autenticação agora só pelo Supabase


// Rotas de autenticação removidas: agora apenas Supabase Auth

// Removido: já declarado no início do arquivo

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
// app.use('/api/auth/social', authSocial); // Removido: autenticação agora só pelo Supabase

// Inicia a sessão do WhatsApp ao iniciar o servidor
startWA();

app.get('/', (req, res) => {
    res.json({ message: "API do PedZap Desktop está no ar!" });
});

app.get('/api/menu', (req, res) => {
    const sql = "SELECT * FROM menu_items ORDER BY category, name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.status(200).json({
            "message": "success",
            "data": rows
        });
    });
});
app.get('/api/settings', (req, res) => {
    const sql = "SELECT * FROM bot_settings";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.status(200).json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/menu', (req, res) => {
    const { category, name, price, description } = req.body;
    const sql = `INSERT INTO menu_items (category, name, price, description) VALUES (?, ?, ?, ?)`;
    const params = [category, name, price, description];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, ...req.body }
        });
    });
});

app.put('/api/menu/:id', (req, res) => {
    const { category, name, price, description } = req.body;
    const sql = `UPDATE menu_items set 
                    category = COALESCE(?, category), 
                    name = COALESCE(?, name), 
                    price = COALESCE(?, price), 
                    description = COALESCE(?, description) 
                 WHERE id = ?`;
    const params = [category, name, price, description, req.params.id];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json({
            message: "success",
            changes: this.changes
        });
    });
});
app.put('/api/settings', (req, res) => {
    const settings = req.body; // Espera um array: [{ id: 1, value: "novo texto" }, ...]
    
    if (!Array.isArray(settings)) {
        return res.status(400).json({ "error": "O corpo da requisição deve ser um array." });
    }

    const sql = `UPDATE bot_settings SET setting_value = ? WHERE id = ?`;
    
    // O serialize garante que os comandos rodem em ordem, um após o outro
    db.serialize(() => {
        const stmt = db.prepare(sql);
        settings.forEach(setting => {
            stmt.run(setting.value, setting.id);
        });
        stmt.finalize((err) => {
            if (err) {
                return res.status(500).json({ "error": err.message });
            }
            res.status(200).json({ message: "Configurações atualizadas com sucesso." });
        });
    });
});


app.delete('/api/menu/:id', (req, res) => {
    const sql = 'DELETE FROM menu_items WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json({
            "message": "deleted",
            changes: this.changes
        });
    });
});

// Webhook para receber mensagens do WhatsApp
app.post('/webhook', async (req, res) => {
    try {
        const entry = req.body.entry && req.body.entry[0];
        const changes = entry && entry.changes && entry.changes[0];
        const value = changes && changes.value;
        const messages = value && value.messages;
        if (!messages || !Array.isArray(messages)) {
            return res.sendStatus(200);
        }
        for (const msg of messages) {
            const from = msg.from;
            const text = msg.text && msg.text.body;
            if (from && text) {
                const reply = await handleFlow(from, text, userSessions);
                if (reply) {
                    await sendMessage(from, reply);
                }
            }
        }
        res.sendStatus(200);
    } catch (err) {
        console.error('Erro no webhook:', err);
        res.sendStatus(500);
    }
});

// Criar novo pedido
app.post('/api/orders', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id é obrigatório.' });
    const sql = `INSERT INTO orders (user_id, status) VALUES (?, 'aberto')`;
    db.run(sql, [user_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ order_id: this.lastID });
    });
});

// Adicionar item ao pedido
app.post('/api/orders/:order_id/items', (req, res) => {
    const { order_id } = req.params;
    const { product_name, product_price, quantity } = req.body;
    if (!product_name || !product_price) return res.status(400).json({ error: 'Dados do produto obrigatórios.' });
    const sql = `INSERT INTO order_items (order_id, product_name, product_price, quantity) VALUES (?, ?, ?, ?)`;
    db.run(sql, [order_id, product_name, product_price, quantity || 1], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ item_id: this.lastID });
    });
});

// Consultar pedidos de um usuário
app.get('/api/orders/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;
    db.all(sql, [user_id], (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ orders });
    });
});

// Consultar itens de um pedido
app.get('/api/orders/:order_id/items', (req, res) => {
    const { order_id } = req.params;
    const sql = `SELECT * FROM order_items WHERE order_id = ?`;
    db.all(sql, [order_id], (err, items) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ items });
    });
});

// Listar todos os pedidos (para o painel)
app.get('/api/orders/all', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ orders });
    });
});

// Marcar pedido como saiu para entrega
app.put('/api/orders/:id/entrega', (req, res) => {
    const { id } = req.params;
    db.run('UPDATE orders SET status = ? WHERE id = ?', ['entrega', id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Pedido saiu para entrega.' });
    });
});

// Finalizar pedido
app.put('/api/orders/:id/finalizar', (req, res) => {
    const { id } = req.params;
    db.run('UPDATE orders SET status = ? WHERE id = ?', ['finalizado', id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Pedido finalizado.' });
    });
});

// Rota para obter o QR Code em base64 ou status de conexão
app.get('/api/wa/qr', (req, res) => {
    const { qr, connected } = require('./waSession').getWAStatus();
    console.log('[DEBUG] QR retornado para frontend:', qr, 'Connected:', connected);
    if (connected) {
        res.json({ status: 'connected' });
    } else if (qr) {
        res.json({ qr });
    } else {
        res.status(404).json({ error: 'QR Code não disponível no momento.' });
    }
});

// Rotas de categorias
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ categories: rows });
    });
});

app.post('/api/categories', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
    db.run('INSERT INTO categories (name) VALUES (?)', [name], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name });
    });
});

app.put('/api/categories/:id', (req, res) => {
    const { name } = req.body;
    db.run('UPDATE categories SET name = ? WHERE id = ?', [name, req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Categoria atualizada.' });
    });
});

app.delete('/api/categories/:id', (req, res) => {
    db.run('DELETE FROM categories WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Categoria excluída.' });
    });
});

const contatoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo de 5 envios por IP
    message: { error: 'Muitas tentativas, tente novamente mais tarde.' }
});

app.post('/api/contato', contatoLimiter, async (req, res) => {
    const { nome, email, whatsapp, assunto, descricao, website } = req.body;
    // Honeypot: se o campo website estiver preenchido, é bot
    if (website) return res.status(400).json({ error: 'Requisição bloqueada.' });
    // Validação básica
    if (!nome || !email || !whatsapp || !assunto || !descricao) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
    }
    if (!/^[\w\s]{2,50}$/.test(nome)) return res.status(400).json({ error: 'Nome inválido.' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'E-mail inválido.' });
    if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(whatsapp)) return res.status(400).json({ error: 'WhatsApp inválido.' });
    if (assunto.length < 2 || assunto.length > 100) return res.status(400).json({ error: 'Assunto inválido.' });
    if (descricao.length < 5 || descricao.length > 2000) return res.status(400).json({ error: 'Descrição inválida.' });
    try {
        await sendContatoMail({ nome, email, whatsapp, assunto, descricao });
        res.json({ ok: true, message: 'Mensagem enviada com sucesso!' });
    } catch (err) {
        console.error('Erro ao enviar e-mail de contato:', err);
        res.status(500).json({ error: 'Erro ao enviar mensagem. Tente novamente mais tarde.' });
    }
});

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://efvbgcbfbbrggyzdjwhf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_MnFwaQ0WGLCa5dkdBVQyvA_RDAdISFR';
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Middleware para checar se é admin
async function isAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não enviado.' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.decode(token);
    if (payload?.user_metadata?.tipo === 'admin') {
      req.user = payload;
      return next();
    }
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

// Listar todos os usuários
app.get('/api/admin/users', isAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ users: data.users });
});

// Atualizar tipo de conta do usuário
app.put('/api/admin/users/:id/type', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;
  if (!['free', 'premium', 'admin'].includes(tipo)) return res.status(400).json({ error: 'Tipo inválido.' });
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, { user_metadata: { tipo } });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ user: data.user });
});

app.use(bodyParser.json());
app.use('/api/webhook/stripe', bodyParser.raw({type: 'application/json'}));

// Endpoint para criar sessão de checkout Stripe
app.post('/api/checkout', async (req, res) => {
  const { userId, email } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price: 'price_XXXXXXXXXXXXXX', // Troque pelo ID do preço do seu produto no Stripe
        quantity: 1,
      }],
      mode: 'subscription', // ou 'payment' para compra única
      success_url: 'http://localhost:3000/sucesso', // Troque para sua URL de sucesso
      cancel_url: 'http://localhost:3000/cancelado', // Troque para sua URL de cancelamento
      metadata: { userId }
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook Stripe para promover usuário a premium
app.post('/api/webhook/stripe', bodyParser.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET); // Adicione sua chave de webhook do Stripe no .env
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    // Atualiza o usuário para premium no Supabase
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { tipo: 'premium' }
    });
  }
  res.json({received: true});
});

app.use(helmet());

app.listen(PORT, () => {
    console.log(`Servidor da API interna rodando na porta ${PORT}`);
});

module.exports = app;