import React, { useEffect, useState } from 'react';
import { Card, Button, Spin, Alert, Form, Input, message } from 'antd';

const apiBaseUrl = 'http://localhost:3001/api';

// Função utilitária para deixar nomes legíveis
function formatLabel(key) {
  // Tradução direta para campos conhecidos
  const map = {
    'welcome message': 'Mensagem de Boas-vindas',
    'ask for category message': 'Mensagem para Escolher Categoria',
    'invalid option message': 'Mensagem de Opção Inválida',
    'cancel message': 'Mensagem de Cancelamento',
  };
  const lower = key.replace(/_/g, ' ').toLowerCase();
  if (map[lower]) return map[lower];
  // Tradução automática para outros campos
  return key
    .replace(/_/g, ' ')
    .replace(/\b(bot|wa|zap)\b/gi, s => s.toUpperCase())
    .replace(/\b(token)\b/gi, 'Token')
    .replace(/\b(id)\b/gi, 'ID')
    .replace(/\b(qr)\b/gi, 'QR')
    .replace(/\b(api)\b/gi, 'API')
    .replace(/\b(msg)\b/gi, 'Mensagem')
    .replace(/\b(cfg)\b/gi, 'Configuração')
    .replace(/\b(num|number)\b/gi, 'Número')
    .replace(/\b(chat)\b/gi, 'Chat')
    .replace(/\b(phone|telefone)\b/gi, 'Telefone')
    .replace(/\b(email)\b/gi, 'E-mail')
    .replace(/\b(name|nome)\b/gi, 'Nome')
    .replace(/\b(user|usuario)\b/gi, 'Usuário')
    .replace(/\b(pass|senha)\b/gi, 'Senha')
    .replace(/\b(secret|segredo)\b/gi, 'Segredo')
    .replace(/\b(url)\b/gi, 'URL')
    .replace(/\b(key|chave)\b/gi, 'Chave')
    .replace(/\b(server|servidor)\b/gi, 'Servidor')
    .replace(/\b(port|porta)\b/gi, 'Porta')
    .replace(/\b(desc|descrição)\b/gi, 'Descrição')
    .replace(/\b(cfg|configuração)\b/gi, 'Configuração')
    .replace(/\b(status)\b/gi, 'Status')
    .replace(/\b(ativo)\b/gi, 'Ativo')
    .replace(/\b(inativo)\b/gi, 'Inativo')
    .replace(/\b(\w)/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

export default function BotPanel() {
  const [qr, setQr] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState([]);
  const [saving, setSaving] = useState(false);

  // Carrega status do WhatsApp
  const loadWAStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/wa/qr`);
      const data = await res.json();
      if (data.status === 'connected') {
        setConnected(true);
        setQr(null);
      } else if (data.qr) {
        setConnected(false);
        setQr(data.qr);
      } else {
        setConnected(false);
        setQr(null);
      }
    } catch (e) {
      setConnected(false);
      setQr(null);
    }
    setLoading(false);
  };

  // Carrega configurações do bot
  const loadSettings = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/settings`);
      const data = await res.json();
      setSettings(data.data || []);
    } catch (e) {
      setSettings([]);
    }
  };

  useEffect(() => {
    loadWAStatus();
    loadSettings();
    const interval = setInterval(loadWAStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async (values) => {
    setSaving(true);
    // Monta array [{id, value}] para enviar
    const toSend = settings.map(s => ({ id: s.id, value: values[`setting_${s.id}`] }));
    try {
      const res = await fetch(`${apiBaseUrl}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSend)
      });
      if (res.ok) {
        message.success('Configurações salvas!');
        loadSettings();
      } else {
        message.error('Erro ao salvar configurações.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Bot WhatsApp" style={{ maxWidth: 600, margin: '0 auto' }}>
      {loading ? <Spin /> : (
        <>
          {connected ? (
            <Alert message="Bot conectado ao WhatsApp!" type="success" showIcon style={{ marginBottom: 16 }} />
          ) : qr ? (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Alert message="Escaneie o QR Code abaixo no WhatsApp para conectar o bot." type="info" showIcon style={{ marginBottom: 8 }} />
              <img src={`data:image/png;base64,${qr}`} alt="QR Code" style={{ width: 240, height: 240, margin: '0 auto' }} />
            </div>
          ) : (
            <Alert message="Bot desconectado. Aguarde ou reinicie o backend." type="warning" showIcon style={{ marginBottom: 16 }} />
          )}
          <Button onClick={loadWAStatus} style={{ marginBottom: 24 }}>Atualizar Status</Button>
          <Form layout="vertical" onFinish={handleSave} initialValues={Object.fromEntries(settings.map(s => [`setting_${s.id}`, s.setting_value]))}>
            <h4>Configurações do Bot</h4>
            {settings.map(s => (
              <Form.Item key={s.id} name={`setting_${s.id}`} label={<b>{formatLabel(s.setting_key)}</b>} style={{ marginBottom: 24, background: '#f6f8fa', padding: 16, borderRadius: 8 }}>
                <Input defaultValue={s.setting_value} style={{ fontSize: 16, padding: 8 }} />
              </Form.Item>
            ))}
            <Button type="primary" htmlType="submit" loading={saving} style={{ marginTop: 8 }}>Salvar Configurações</Button>
          </Form>
        </>
      )}
    </Card>
  );
} 