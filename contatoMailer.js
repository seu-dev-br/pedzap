const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Carrega configuração do arquivo
function loadConfig() {
    const configPath = path.join(__dirname, 'contatoEmailConfig.txt');
    const config = {};
    if (fs.existsSync(configPath)) {
        const lines = fs.readFileSync(configPath, 'utf-8').split('\n');
        lines.forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...rest] = line.split('=');
                config[key.trim()] = rest.join('=').trim();
            }
        });
    }
    return config;
}

async function sendContatoMail({ nome, email, whatsapp, assunto, descricao }) {
    const cfg = loadConfig();
    if (!cfg.SMTP_USER || !cfg.SMTP_PASS || !cfg.EMAIL_TO) throw new Error('Configuração de e-mail incompleta.');
    const transporter = nodemailer.createTransport({
        host: cfg.SMTP_HOST,
        port: Number(cfg.SMTP_PORT),
        secure: cfg.SMTP_SECURE === 'true',
        auth: {
            user: cfg.SMTP_USER,
            pass: cfg.SMTP_PASS
        }
    });
    const mailOptions = {
        from: `PedZap Contato <${cfg.SMTP_USER}>`,
        to: cfg.EMAIL_TO,
        subject: `[PedZap] Contato: ${assunto}`,
        replyTo: email,
        text: `Nome: ${nome}\nE-mail: ${email}\nWhatsApp: ${whatsapp}\nAssunto: ${assunto}\n\n${descricao}`,
        html: `<b>Nome:</b> ${nome}<br><b>E-mail:</b> ${email}<br><b>WhatsApp:</b> ${whatsapp}<br><b>Assunto:</b> ${assunto}<br><br>${descricao.replace(/\n/g,'<br>')}`
    };
    await transporter.sendMail(mailOptions);
}

module.exports = { sendContatoMail };
