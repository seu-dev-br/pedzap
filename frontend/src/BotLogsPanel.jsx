import React, { useEffect, useState } from 'react';
import { Card, Table, Spin, Button } from 'antd';

const apiBaseUrl = 'http://localhost:3001/api';

export default function BotLogsPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/bot/logs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      setLogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const columns = [
    { title: 'Data/Hora', dataIndex: 'timestamp', key: 'timestamp', width: 180 },
    { title: 'Tipo', dataIndex: 'type', key: 'type', width: 100 },
    { title: 'Mensagem', dataIndex: 'message', key: 'message' },
  ];

  return (
    <Card title="Logs do Bot WhatsApp" style={{ maxWidth: 900, margin: '0 auto' }}>
      <Button onClick={loadLogs} style={{ marginBottom: 16 }}>Atualizar</Button>
      {loading ? <Spin /> : (
        <Table columns={columns} dataSource={logs} rowKey="timestamp" pagination={{ pageSize: 20 }} />
      )}
    </Card>
  );
} 