// waConnect.js

document.addEventListener('DOMContentLoaded', () => {
    const qrContainer = document.getElementById('qr-container');
    const statusMsg = document.getElementById('status-msg');

    let polling = true;
    async function fetchQR() {
        if (!polling) return;
        try {
            const response = await fetch('http://localhost:3001/api/wa/qr');
            if (!response.ok) throw new Error('QR Code não disponível.');
            const data = await response.json();
            if (data.status === 'connected') {
                qrContainer.innerHTML = '<p>✅ WhatsApp conectado com sucesso!</p>';
                statusMsg.textContent = 'Você já está conectado ao WhatsApp.';
                polling = false;
                return;
            }
            qrContainer.innerHTML = `<img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.qr)}&size=250x250" alt="QR Code WhatsApp" />`;
            statusMsg.textContent = 'Abra o WhatsApp, vá em Menu > Aparelhos conectados > Conectar um aparelho e escaneie o QR Code.';
        } catch (err) {
            qrContainer.innerHTML = '<p>Aguardando QR Code...</p>';
            statusMsg.textContent = 'Assim que o QR Code estiver pronto, ele aparecerá aqui automaticamente.';
        }
    }

    fetchQR();
    const interval = setInterval(() => {
        if (polling) fetchQR();
        else clearInterval(interval);
    }, 5000); // Atualiza o QR Code a cada 5s
});
