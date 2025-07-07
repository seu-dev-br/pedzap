import { useEffect, useState } from 'react';
import { Button, Card, Statistic, message, Spin } from 'antd';

function PremiumPage({ user }) {
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    async function fetchResumo() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/resumo7dias?user_id=${user.id}`);
        const data = await res.json();
        setResumo(data);
      } catch (e) {
        message.error('Erro ao buscar resumo dos pedidos');
      }
      setLoading(false);
    }
    if (user) fetchResumo();
  }, [user]);

  const comprarPremium = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email })
      });
      const { url } = await res.json();
      if (window.require && window.require('electron')) {
        const { shell } = window.require('electron');
        shell.openExternal(url);
      } else {
        window.location.href = url;
      }
    } catch (e) {
      message.error('Erro ao iniciar compra');
    }
    setLoading(false);
  };

  return (
    <Card title="Acesso Premium" style={{ maxWidth: 500, margin: '32px auto' }}>
      <div style={{ marginBottom: 24 }}>
        <b>Status da conta:</b> {user?.user_metadata?.tipo === 'premium' ? 'Premium' : 'Free'}
      </div>
      {user?.user_metadata?.tipo !== 'premium' && (
        <Button type="primary" onClick={comprarPremium} loading={loading} block>
          Comprar Premium
        </Button>
      )}
      <div style={{ marginTop: 32 }}>
        <h3>Pedidos nos últimos 7 dias</h3>
        {loading ? <Spin /> : resumo && (
          <div style={{ display: 'flex', gap: 24 }}>
            <Statistic title="Total de Pedidos" value={resumo.totalPedidos} />
            <Statistic title="Valor Total" value={resumo.valorTotal} prefix="R$" precision={2} />
          </div>
        )}
      </div>
    </Card>
  );
}

export default PremiumPage; 