// settings.js
document.addEventListener('DOMContentLoaded', () => {
    const fieldsContainer = document.getElementById('fields-container');
    const settingsForm = document.getElementById('settings-form');
    const apiBaseUrl = 'http://localhost:3001/api';

    async function loadSettings() {
        try {
            const response = await fetch(`${apiBaseUrl}/settings`);
            const result = await response.json();
            
            fieldsContainer.innerHTML = ''; // Limpa a barra de progresso

            result.data.forEach(setting => {
                if (setting.setting_key === 'whatsapp_token' || setting.setting_key === 'phone_number_id') return;
                let labelText = setting.setting_key.replace(/_/g, ' ').replace('message', ' (mensagem)').replace('pix key', 'Chave PIX').replace('openrouter api key', 'Chave OpenRouter (LLM)').replace('llm prompt', 'Prompt do LLM (personalize o comportamento do atendimento)').replace(/\b\w/g, l => l.toUpperCase());
                if (setting.setting_key === 'openrouter_api_key') labelText = 'Chave de API do OpenRouter (LLM)';
                if (setting.setting_key === 'llm_prompt') labelText = 'Prompt do LLM (personalize o comportamento do atendimento)';
                const label = document.createElement('label');
                label.setAttribute('for', `setting-${setting.id}`);
                label.textContent = labelText;

                const textarea = document.createElement('textarea');
                textarea.id = `setting-${setting.id}`;
                textarea.name = setting.id;
                textarea.rows = setting.setting_key === 'llm_prompt' ? 4 : 2;
                textarea.value = setting.setting_value;
                if (setting.setting_key === 'openrouter_api_key') {
                    textarea.placeholder = 'Cole aqui sua chave gratuita do OpenRouter (https://openrouter.ai/)';
                }
                if (setting.setting_key === 'llm_prompt') {
                    textarea.placeholder = 'Exemplo: Você é um assistente de atendimento para pedidos de restaurante via WhatsApp...';
                }
                label.appendChild(textarea);
                fieldsContainer.appendChild(label);
            });

        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            fieldsContainer.innerHTML = '<p>Erro ao carregar as configurações.</p>';
        }
    }

    settingsForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const textareas = fieldsContainer.querySelectorAll('textarea');
        const settingsToUpdate = [];

        textareas.forEach(textarea => {
            settingsToUpdate.push({
                id: textarea.name,
                value: textarea.value
            });
        });

        try {
            const response = await fetch(`${apiBaseUrl}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsToUpdate)
            });

            if (!response.ok) throw new Error('Falha ao salvar as configurações.');
            
            alert('Configurações salvas com sucesso!');

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar as configurações.');
        }
    });

    loadSettings();
});