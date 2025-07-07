// database.js
const sqlite3 = require('sqlite3').verbose();

// O nome do arquivo do nosso banco de dados.
const DB_SOURCE = "pedzap.db";

// Cria e/ou conecta ao banco de dados.
// O construtor sqlite3.Database abrirá o banco de dados (se ele existir)
// ou o criará se o arquivo não existir.
const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        // Não foi possível abrir o banco de dados
        console.error(err.message);
        throw err;
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // O método .serialize garante que os comandos sejam executados em sequência.
        db.serialize(() => {
            console.log('Criando tabelas e inserindo dados iniciais...');
            
            // Comando para criar a tabela de itens do cardápio
            // "IF NOT EXISTS" previne erros se a tabela já tiver sido criada.
            db.run(`CREATE TABLE IF NOT EXISTS menu_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT
            )`);

            // Comando para criar a tabela de configurações/mensagens do bot
            db.run(`CREATE TABLE IF NOT EXISTS bot_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_key TEXT NOT NULL UNIQUE,
                setting_value TEXT NOT NULL
            )`);
            
            // Inserindo mensagens padrão para o bot.
            // "INSERT OR IGNORE" só insere se a 'setting_key' ainda não existir.
            const defaultSettings = [
                { key: 'welcome_message', value: 'Olá! 👋 Bem-vindo ao PedZap! Para ver o cardápio, digite *cardapio* ou *pedir*.' },
                { key: 'ask_for_category_message', value: 'Certo! O que você gostaria de pedir hoje?' },
                { key: 'invalid_option_message', value: 'Não entendi sua resposta. Por favor, tente novamente ou digite *cancelar* para recomeçar.' },
                { key: 'cancel_message', value: 'Seu pedido foi cancelado. Se quiser começar de novo, é só chamar! 👋' },
                { key: 'pix_key', value: '' },
                { key: 'openrouter_api_key', value: '' },
                { key: 'llm_prompt', value: 'Você é um assistente de atendimento para pedidos de restaurante via WhatsApp. Responda de forma clara, educada e objetiva, guiando o cliente para fazer um pedido, tirar dúvidas ou avançar no atendimento.' }
            ];

            const stmt = db.prepare("INSERT OR IGNORE INTO bot_settings (setting_key, setting_value) VALUES (?, ?)");
            defaultSettings.forEach(setting => {
                stmt.run(setting.key, setting.value);
            });
            stmt.finalize(); // Finaliza a instrução preparada

            // Tabela de pedidos
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'aberto',
                observation TEXT,
                address TEXT,
                payment_method TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Tabela de itens do pedido
            db.run(`CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                product_price REAL NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY(order_id) REFERENCES orders(id)
            )`);

            // Tabela de categorias
            db.run(`CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )`);

            // Garante categorias padrão se não houver nenhuma
            db.get('SELECT COUNT(*) as count FROM categories', [], (err, row) => {
                if (!err && row && row.count === 0) {
                    const defaultCategories = ['Pizza', 'Sanduíche', 'Bebida', 'Sobremesa'];
                    const catStmt = db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
                    defaultCategories.forEach(cat => catStmt.run(cat));
                    catStmt.finalize();
                }
            });

            console.log('Banco de dados pronto para uso.');
        });
    }
});

// Exporta a conexão do banco de dados para que outros arquivos possam usá-la.
module.exports = db;