// botFlow.js
const { askLLM } = require('./llm');
const userSessions = {};

async function handleFlow(from, message, userSessions) {
    const normalizedMsg = message.trim().toLowerCase();
    const db = require('./database');

    // Comandos de fluxo que não vão para o LLM
    const comandosFluxo = ["cardápio", "cardapio", "menu", "oi", "olá", "inicio", "início", "sim", "não", "nao", "voltar", "finalizar"];
    // Monta contexto do pedido atual
    let contextoPedido = '';
    if (userSessions[from] && userSessions[from].orderId) {
        const orderId = userSessions[from].orderId;
        // Busca itens do pedido
        const items = await new Promise((resolve, reject) => {
            db.all(
                "SELECT product_name, product_price, quantity FROM order_items WHERE order_id = ?",
                [orderId],
                (err, rows) => {
                    if (err) return resolve([]);
                    resolve(rows);
                }
            );
        });
        if (items.length > 0) {
            contextoPedido += 'Itens do pedido até agora:\n';
            items.forEach(item => {
                contextoPedido += `- ${item.product_name} (x${item.quantity})\n`;
            });
        }
        // Busca observação, endereço e pagamento
        const order = await new Promise((resolve, reject) => {
            db.get(
                "SELECT observation, address, payment_method FROM orders WHERE id = ?",
                [orderId],
                (err, row) => {
                    if (err) return resolve({});
                    resolve(row || {});
                }
            );
        });
        if (order.observation) contextoPedido += `Obs: ${order.observation}\n`;
        if (order.address) contextoPedido += `Endereço: ${order.address}\n`;
        if (order.payment_method) contextoPedido += `Pagamento: ${order.payment_method}\n`;
    }

    if (!comandosFluxo.includes(normalizedMsg)) {
        // Busca prompt customizado do banco
        const promptBase = await new Promise((resolve, reject) => {
            db.get(
                "SELECT setting_value FROM bot_settings WHERE setting_key = 'llm_prompt'",
                [],
                (err, row) => {
                    if (err) return resolve(null);
                    resolve(row ? row.setting_value : null);
                }
            );
        });
        const prompt = `${promptBase || 'Você é um assistente de atendimento para pedidos de restaurante via WhatsApp.'}\n${contextoPedido ? 'Contexto do pedido atual:\n' + contextoPedido + '\n' : ''}O cliente enviou: "${message}".`;
        const llmResult = await askLLM(prompt);
        if (llmResult) return llmResult;
    }

    // Início da conversa
    if (!userSessions[from] || ["oi", "olá", "inicio", "início"].includes(normalizedMsg)) {
        userSessions[from] = { step: "welcome" };
        const welcomeMsg = await new Promise((resolve, reject) => {
            db.get(
                "SELECT setting_value FROM bot_settings WHERE setting_key = ?",
                ["welcome_message"],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row ? row.setting_value : "Olá! Seja bem-vindo ao PedZap.");
                }
            );
        });
        return welcomeMsg + "\n\nDigite 'cardápio' para ver nossas opções!";
    }

    // Se o usuário pedir o cardápio
    if (["cardápio", "cardapio", "menu"].includes(normalizedMsg)) {
        userSessions[from].step = "showing_categories";
        const categories = await new Promise((resolve, reject) => {
            db.all(
                "SELECT DISTINCT category FROM menu_items ORDER BY category",
                [],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows.map(r => r.category));
                }
            );
        });
        if (categories.length === 0) {
            return "Desculpe, não há categorias cadastradas no momento.";
        }
        let msg = "Escolha uma categoria:\n";
        categories.forEach((cat, idx) => {
            msg += `${idx + 1}. ${cat}\n`;
        });
        msg += "\nResponda com o número da categoria desejada.";
        userSessions[from].categories = categories;
        return msg;
    }

    // Usuário escolhe uma categoria
    if (userSessions[from] && userSessions[from].step === "showing_categories") {
        const idx = parseInt(normalizedMsg, 10);
        const categories = userSessions[from].categories || [];
        if (!isNaN(idx) && idx >= 1 && idx <= categories.length) {
            const chosenCategory = categories[idx - 1];
            userSessions[from].step = "showing_products";
            userSessions[from].chosenCategory = chosenCategory;
            const products = await new Promise((resolve, reject) => {
                db.all(
                    "SELECT name, price, description FROM menu_items WHERE category = ? ORDER BY name",
                    [chosenCategory],
                    (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows);
                    }
                );
            });
            if (products.length === 0) {
                return `Não há produtos cadastrados na categoria ${chosenCategory}.`;
            }
            let msg = `Produtos em ${chosenCategory}:\n`;
            products.forEach((prod, idx) => {
                msg += `${idx + 1}. ${prod.name} - R$ ${Number(prod.price).toFixed(2).replace('.', ',')}`;
                if (prod.description) msg += `\n   ${prod.description}`;
                msg += "\n";
            });
            msg += "\nResponda com o número do produto para escolher, ou digite 'voltar' para ver as categorias novamente.";
            userSessions[from].products = products;
            return msg;
        } else {
            return "Opção inválida. Por favor, responda com o número de uma das categorias.";
        }
    }

    // Usuário escolhe um produto
    if (userSessions[from] && userSessions[from].step === "showing_products") {
        if (normalizedMsg === 'voltar') {
            userSessions[from].step = "showing_categories";
            const categories = userSessions[from].categories || [];
            if (categories.length === 0) {
                return "Desculpe, não há categorias cadastradas no momento.";
            }
            let msg = "Escolha uma categoria:\n";
            categories.forEach((cat, idx) => {
                msg += `${idx + 1}. ${cat}\n`;
            });
            msg += "\nResponda com o número da categoria desejada.";
            return msg;
        }
        const idx = parseInt(normalizedMsg, 10);
        const products = userSessions[from].products || [];
        if (!isNaN(idx) && idx >= 1 && idx <= products.length) {
            const chosenProduct = products[idx - 1];
            userSessions[from].step = "confirming_product";
            userSessions[from].chosenProduct = chosenProduct;
            let msg = `Você escolheu: ${chosenProduct.name}\nPreço: R$ ${Number(chosenProduct.price).toFixed(2).replace('.', ',')}`;
            if (chosenProduct.description) msg += `\n${chosenProduct.description}`;
            msg += "\n\nDigite 'confirmar' para adicionar ao pedido ou 'voltar' para escolher outro produto.";
            return msg;
        } else {
            return "Opção inválida. Por favor, responda com o número de um dos produtos ou 'voltar'.";
        }
    }

    // Confirmação do produto
    if (userSessions[from] && userSessions[from].step === "confirming_product") {
        if (normalizedMsg === 'voltar') {
            userSessions[from].step = "showing_products";
            const products = userSessions[from].products || [];
            const chosenCategory = userSessions[from].chosenCategory;
            if (products.length === 0) {
                return `Não há produtos cadastrados na categoria ${chosenCategory}.`;
            }
            let msg = `Produtos em ${chosenCategory}:\n`;
            products.forEach((prod, idx) => {
                msg += `${idx + 1}. ${prod.name} - R$ ${Number(prod.price).toFixed(2).replace('.', ',')}`;
                if (prod.description) msg += `\n   ${prod.description}`;
                msg += "\n";
            });
            msg += "\nResponda com o número do produto para escolher, ou digite 'voltar' para ver as categorias novamente.";
            return msg;
        }
        if (normalizedMsg === 'confirmar') {
            const chosenProduct = userSessions[from].chosenProduct;
            if (!userSessions[from].orderId) {
                userSessions[from].orderId = await new Promise((resolve, reject) => {
                    db.run(
                        "INSERT INTO orders (user_id, status) VALUES (?, 'aberto')",
                        [from],
                        function(err) {
                            if (err) return reject(err);
                            resolve(this.lastID);
                        }
                    );
                });
            }
            await new Promise((resolve, reject) => {
                db.run(
                    "INSERT INTO order_items (order_id, product_name, product_price, quantity) VALUES (?, ?, ?, ?)",
                    [userSessions[from].orderId, chosenProduct.name, chosenProduct.price, 1],
                    function(err) {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            });
            userSessions[from].step = "add_more_items";
            return `Produto adicionado ao pedido!\n\nDeseja adicionar mais itens?\nResponda 'sim' para continuar escolhendo ou 'finalizar' para encerrar o pedido.`;
        } else {
            return "Opção inválida. Por favor, digite 'confirmar' para adicionar ao pedido ou 'voltar' para escolher outro produto.";
        }
    }

    // Adicionar mais itens
    if (userSessions[from] && userSessions[from].step === "add_more_items") {
        if (normalizedMsg === 'sim') {
            userSessions[from].step = "showing_categories";
            const categories = await new Promise((resolve, reject) => {
                db.all(
                    "SELECT DISTINCT category FROM menu_items ORDER BY category",
                    [],
                    (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows.map(r => r.category));
                    }
                );
            });
            userSessions[from].categories = categories;
            let msg = "Escolha uma categoria:\n";
            categories.forEach((cat, idx) => {
                msg += `${idx + 1}. ${cat}\n`;
            });
            msg += "\nResponda com o número da categoria desejada.";
            return msg;
        }
        if (normalizedMsg === 'finalizar') {
            userSessions[from].step = "awaiting_observation";
            return "Se desejar, envie uma observação para o pedido (ex: sem cebola, entregar na portaria, etc).\nSe não quiser adicionar observação, responda 'não'.";
        }
        return "Responda 'sim' para adicionar mais itens ou 'finalizar' para encerrar o pedido.";
    }

    // Observação do pedido
    if (userSessions[from] && userSessions[from].step === "awaiting_observation") {
        const orderId = userSessions[from].orderId;
        let observation = message.trim();
        // Normaliza para remover acentos, aspas e case
        const normalizeNao = (txt) => txt.toLowerCase().normalize('NFD').replace(/['"`´]/g, '').replace(/\p{Diacritic}/gu, '');
        const obsNorm = normalizeNao(observation);
        if (obsNorm !== 'nao') {
            // Usa LLM para interpretar a observação
            const prompt = `O cliente escreveu a seguinte observação para o pedido: "${observation}". Resuma ou interprete de forma clara para a cozinha.`;
            const llmResult = await askLLM(prompt);
            if (llmResult) observation = llmResult;
        } else {
            observation = '';
        }
        // Salva observação no pedido
        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE orders SET observation = ? WHERE id = ?",
                [observation, orderId],
                function(err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
        userSessions[from].step = "awaiting_address";
        return "Agora, por favor, envie o endereço de entrega completo.";
    }

    // Coleta de endereço
    if (userSessions[from] && userSessions[from].step === "awaiting_address") {
        const orderId = userSessions[from].orderId;
        const address = message.trim();
        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE orders SET address = ? WHERE id = ?",
                [address, orderId],
                function(err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
        userSessions[from].step = "awaiting_payment";
        return "Qual a forma de pagamento? (ex: dinheiro, cartão, pix)";
    }

    // Coleta de forma de pagamento
    if (userSessions[from] && userSessions[from].step === "awaiting_payment") {
        const orderId = userSessions[from].orderId;
        const payment = message.trim();
        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE orders SET payment_method = ?, status = 'finalizado' WHERE id = ?",
                [payment, orderId],
                function(err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
        // Busca itens do pedido
        const items = await new Promise((resolve, reject) => {
            db.all(
                "SELECT product_name, product_price, quantity FROM order_items WHERE order_id = ?",
                [orderId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });
        // Busca observação, endereço e pagamento
        const order = await new Promise((resolve, reject) => {
            db.get(
                "SELECT observation, address, payment_method FROM orders WHERE id = ?",
                [orderId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });
        userSessions[from] = undefined;
        let resumo = 'Seu pedido foi finalizado!\n\nResumo:\n';
        let total = 0;
        items.forEach(item => {
            resumo += `- ${item.product_name} (x${item.quantity}): R$ ${Number(item.product_price).toFixed(2).replace('.', ',')}\n`;
            total += item.product_price * item.quantity;
        });
        if (order.observation) resumo += `\nObs: ${order.observation}`;
        if (order.address) resumo += `\nEndereço: ${order.address}`;
        if (order.payment_method) resumo += `\nPagamento: ${order.payment_method}`;
        resumo += `\nTotal: R$ ${total.toFixed(2).replace('.', ',')}`;
        // Se pagamento for pix, envia a chave pix cadastrada
        if (order.payment_method.toLowerCase().includes('pix')) {
            const pixKey = await new Promise((resolve, reject) => {
                db.get(
                    "SELECT setting_value FROM bot_settings WHERE setting_key = 'pix_key'",
                    [],
                    (err, row) => {
                        if (err) return reject(err);
                        resolve(row && row.setting_value ? row.setting_value : null);
                    }
                );
            });
            if (pixKey) {
                resumo += `\n\nChave PIX para pagamento: ${pixKey}`;
            } else {
                resumo += "\n\nAtenção: Chave PIX não cadastrada. Solicite ao restaurante.";
            }
        }
        return resumo;
    }

    return "Desculpe, não entendi sua resposta. Pode repetir?";
}

module.exports = { handleFlow, userSessions };
