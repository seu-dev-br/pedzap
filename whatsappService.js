require('dotenv').config();
const axios = require('axios');
const db = require('./database');

async function getWhatsAppConfig() {
    return new Promise((resolve, reject) => {
        db.all("SELECT setting_key, setting_value FROM bot_settings WHERE setting_key IN ('whatsapp_token', 'phone_number_id')", [], (err, rows) => {
            if (err) return reject(err);
            const config = {};
            rows.forEach(row => {
                if (row.setting_key === 'whatsapp_token') config.token = row.setting_value;
                if (row.setting_key === 'phone_number_id') config.phoneNumberId = row.setting_value;
            });
            resolve(config);
        });
    });
}

/**
 * Envia uma mensagem de texto para um número de WhatsApp.
 * @param {string} to - O número de telefone do destinatário (com código do país, sem '+').
 * @param {string} text - O conteúdo da mensagem a ser enviada.
 */
async function sendMessage(to, text) {
    let token = process.env.WHATSAPP_TOKEN;
    let phoneNumberId = process.env.PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
        const config = await getWhatsAppConfig();
        token = config.token;
        phoneNumberId = config.phoneNumberId;
    }
    if (!token || !phoneNumberId) {
        console.error("Token ou Phone Number ID do WhatsApp não configurados.");
        return;
    }
    try {
        await axios.post(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
            messaging_product: "whatsapp",
            to: to,
            text: {
                body: text
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Erro ao enviar mensagem via WhatsApp:", error.response ? error.response.data : error.message);
    }
}

module.exports = { sendMessage };