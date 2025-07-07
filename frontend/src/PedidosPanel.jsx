import React, { useEffect, useState } from 'react';
import { Table, Button, Spin, message } from 'antd';

const apiBaseUrl = 'http://localhost:3001/api';

export default function PedidosPanel({ onlyOwn = false, userId, relatorio = false }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPedidos = async () => {
    setLoading(true);
    try {
      let url = onlyOwn && userId ? `${apiBaseUrl}/orders/${userId}` : `${apiBaseUrl}/orders/all`;
      const response = await fetch(url);
      const result = await response.json();
      const pedidos = result.orders || [];
      // Para cada pedido, busca os itens
      const pedidosComItens = await Promise.all(pedidos.map(async (order) => {
        const itemsResp = await fetch(`${apiBaseUrl}/orders/${order.id}/items`);
        const itemsResult = await itemsResp.json();
        return { ...order, items: itemsResult.items || [] };
      }));
      setPedidos(pedidosComItens);
    } catch (e) {
      message.error('Erro ao carregar pedidos.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPedidos();
    const interval = setInterval(loadPedidos, 10000);
    return () => clearInterval(interval);
  }, [onlyOwn, userId]);

  const handleEntrega = async (id) => {
    try {
      await fetch(`${apiBaseUrl}/orders/${id}/entrega`, { method: 'PUT' });
      message.success('Pedido saiu para entrega!');
      loadPedidos();
    } catch (e) {
      message.error('Erro ao atualizar pedido.');
    }
  };
  const handleFinalizar = async (id) => {
    if (!window.confirm('Tem certeza que deseja finalizar este pedido?')) return;
    try {
      await fetch(`${apiBaseUrl}/orders/${id}/finalizar`, { method: 'PUT' });
      message.success('Pedido finalizado!');
      loadPedidos();
    } catch (e) {
      message.error('Erro ao finalizar pedido.');
    }
  };
  const handleImprimir = (pedido) => {
    const win = window.open('', '', 'width=600,height=600');
    win.document.write(`<html><head><title>Imprimir Pedido</title></head><body>`);
    win.document.write(`<h2>Pedido #${pedido.id}</h2>`);
    win.document.write('<table border="1" style="width:100%;border-collapse:collapse;">');
    win.document.write('<tr><th>Status</th><th>Cliente</th><th>Itens</th><th>Obs.</th><th>Endereço</th><th>Pagamento</th><th>Total</th></tr>');
    let total = 0;
    let itensStr = '';
    pedido.items.forEach(item => {
      itensStr += `${item.product_name} (x${item.quantity})<br/>`;
      total += item.product_price * item.quantity;
    });
    win.document.write(`<tr><td>${pedido.status}</td><td>${pedido.user_id}</td><td>${itensStr}</td><td>${pedido.observation || ''}</td><td>${pedido.address || ''}</td><td>${pedido.payment_method || ''}</td><td>R$ ${total.toFixed(2).replace('.', ',')}</td></tr>`);
    win.document.write('</table></body></html>');
    win.document.close();
    win.print();
    win.close();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => {
      if (status === 'finalizado') return <span style={{ color: 'var(--color-verde-impulso)' }}>Finalizado</span>;
      if (status === 'entrega') return <span style={{ color: 'var(--color-azul-confianca)' }}>Entrega</span>;
      return <span style={{ color: 'var(--color-ciano-ativo)' }}>Aberto</span>;
    } },
    { title: 'Cliente', dataIndex: 'user_id', key: 'user_id' },
    { title: 'Itens', key: 'itens', render: (_, record) => record.items.map(i => `${i.product_name} (x${i.quantity})`).join(', ') },
    { title: 'Obs.', dataIndex: 'observation', key: 'observation' },
    { title: 'Endereço', dataIndex: 'address', key: 'address' },
    { title: 'Pagamento', dataIndex: 'payment_method', key: 'payment_method' },
    { title: 'Total', key: 'total', render: (_, record) => {
      const total = record.items.reduce((acc, item) => acc + item.product_price * item.quantity, 0);
      return `R$ ${total.toFixed(2).replace('.', ',')}`;
    } },
    ...(!relatorio ? [{ title: 'Ações', key: 'acoes', render: (_, record) => (
      <>
        <Button 
          size="small" 
          onClick={() => handleImprimir(record)} 
          style={{ 
            marginRight: 4,
            backgroundColor: 'var(--color-ciano-ativo)',
            borderColor: 'var(--color-ciano-ativo)',
            color: 'white'
          }}
        >
          Imprimir
        </Button>
        {record.status === 'aberto' && (
          <Button 
            size="small" 
            onClick={() => handleEntrega(record)} 
            style={{ 
              marginRight: 4,
              backgroundColor: 'var(--color-azul-confianca)',
              borderColor: 'var(--color-azul-confianca)',
              color: 'white'
            }}
          >
            Saiu para Entrega
          </Button>
        )}
        {record.status !== 'finalizado' && (
          <Button 
            size="small" 
            onClick={() => handleFinalizar(record)} 
            style={{
              backgroundColor: 'var(--color-verde-impulso)',
              borderColor: 'var(--color-verde-impulso)',
              color: 'white'
            }}
          >
            Finalizar
          </Button>
        )}
      </>
    ) }] : []),
  ];

  return (
    <div>
      <h3>{relatorio ? 'Relatório de Pedidos' : 'Pedidos Recebidos'}</h3>
      {loading ? <Spin /> : (
        <Table columns={columns} dataSource={pedidos} rowKey="id" pagination={false} style={{ minWidth: 320 }} />
      )}
    </div>
  );
} 