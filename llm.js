// llm.js - Integração com OpenRouter LLM
const db = require('./database');
const axios = require('axios');

async function getOpenRouterKey() {
    return new Promise((resolve, reject) => {
        db.get("SELECT setting_value FROM bot_settings WHERE setting_key = 'openrouter_api_key'", [], (err, row) => {
            if (err) return reject(err);
            resolve(row && row.setting_value ? row.setting_value : null);
        });
    });
}

async function askLLM(prompt) {
    const apiKey = await getOpenRouterKey();
    if (!apiKey) return null;
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openchat/openchat-3.5-0106',
            messages: [
                { role: 'system', content: 'Você é um assistente para interpretação de pedidos de restaurante.' },
                { role: 'user', content: prompt }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        return response.data.choices[0].message.content.trim();
    } catch (err) {
        console.error('[LLM] Erro ao consultar OpenRouter:', err.response ? err.response.data : err.message);
        return null;
    }
}

module.exports = { askLLM };
