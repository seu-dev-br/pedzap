document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contato-form');
    const msg = document.getElementById('contato-msg');
    // Adiciona campo honeypot oculto
    if (!document.getElementById('website')) {
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.id = 'website';
        honeypot.style.display = 'none';
        form.appendChild(honeypot);
    }
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        msg.innerHTML = '';
        try {
            const res = await fetch('/api/contato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                msg.innerHTML = `<article style="border-left:4px solid #2196f3;padding:12px 16px;">Obrigado, <b>${data.nome}</b>! Sua mensagem foi enviada.<br>Em breve nossa equipe entrará em contato pelo WhatsApp ou e-mail informado.</article>`;
                form.reset();
            } else {
                msg.innerHTML = `<article style="border-left:4px solid #f44336;padding:12px 16px;">${result.error || 'Erro ao enviar mensagem.'}</article>`;
            }
        } catch (err) {
            msg.innerHTML = `<article style="border-left:4px solid #f44336;padding:12px 16px;">Erro ao enviar mensagem. Tente novamente mais tarde.</article>`;
        }
    });
});
