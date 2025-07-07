// waSession.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const { handleFlow, userSessions } = require('./botFlow');

let sock;
let qrCodeBase64 = null; // Global e sempre atualizado
let isConnected = false;

async function startWA() {
    console.log('[Baileys] Iniciando sessão WhatsApp...');
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth');
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        getMessage: async () => ({ id: '', message: {} })
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            qrCodeBase64 = qr;
            isConnected = false;
            console.log('[Baileys] QR Code gerado. Pronto para escanear.');
        }
        if (connection) {
            console.log(`[Baileys] Status da conexão: ${connection}`);
        }
        if (connection === 'open') {
            isConnected = true;
            console.log('[Baileys] Conectado com sucesso ao WhatsApp!');
            // Só limpa o QR se já estava conectado
            setTimeout(() => { qrCodeBase64 = null; }, 10000); // Limpa 10s após conectar
        }
        if (connection === 'close') {
            isConnected = false;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('[Baileys] Conexão fechada.', lastDisconnect?.error?.message);
            if (shouldReconnect) {
                console.log('[Baileys] Tentando reconectar...');
                startWA();
            } else {
                console.log('[Baileys] Sessão encerrada.');
            }
        }
    });

    sock.ev.on('creds.update', () => {
        console.log('[Baileys] Credenciais atualizadas.');
        saveCreds();
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) return;
            const from = msg.key.remoteJid;
            let text = '';
            if (msg.message.conversation) text = msg.message.conversation;
            else if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) text = msg.message.extendedTextMessage.text;
            if (!text) return;
            try {
                const reply = await handleFlow(from, text, userSessions);
                if (reply) {
                    await sock.sendMessage(from, { text: reply });
                }
            } catch (err) {
                await sock.sendMessage(from, { text: 'Desculpe, ocorreu um erro no atendimento.' });
            }
        }
    });
}

function getQRCode() {
    return qrCodeBase64;
}

function getWAStatus() {
    return { qr: qrCodeBase64, connected: isConnected };
}

module.exports = { startWA, getQRCode, getWAStatus };
