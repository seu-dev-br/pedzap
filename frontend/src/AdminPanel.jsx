import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Select, message, Spin } from 'antd';
import { supabase } from './supabaseClient';

export default function AdminPanel({ user }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch('http://localhost:3001/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsuarios(data.users || []);
    } catch (e) {
      message.error('Erro ao buscar usuários.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleTipoChange = async (id, tipo) => {
    setSavingId(id);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch(`http://localhost:3001/api/admin/users/${id}/type`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tipo })
      });
      if (res.ok) {
        message.success('Tipo de conta atualizado!');
        fetchUsuarios();
      } else {
        const err = await res.json();
        message.error('Erro: ' + (err.error || 'Falha ao atualizar.'));
      }
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { title: 'Nome', dataIndex: ['user_metadata', 'nome'], key: 'nome', render: (v, r) => v || r.email || '-' },
    { title: 'E-mail', dataIndex: 'email', key: 'email' },
    { title: 'Tipo', dataIndex: ['user_metadata', 'tipo'], key: 'tipo', render: (tipo, r) => (
      <Select
        value={tipo || 'free'}
        onChange={t => handleTipoChange(r.id, t)}
        style={{ width: 120 }}
        disabled={savingId === r.id}
      >
        <Select.Option value="free">Free</Select.Option>
        <Select.Option value="premium">Premium</Select.Option>
        <Select.Option value="admin">Admin</Select.Option>
      </Select>
    ) },
    { title: 'Ações', key: 'acoes', render: (_, r) => (
      <Button size="small" onClick={() => fetchUsuarios()}>Atualizar</Button>
    ) },
  ];

  if (!user?.user_metadata?.tipo || user.user_metadata.tipo !== 'admin') {
    return <Card style={{ maxWidth: 600, margin: '0 auto', marginTop: 32 }}><Spin /> Acesso restrito a administradores.</Card>;
  }

  return (
    <Card title="Administração de Usuários" style={{ maxWidth: 900, margin: '0 auto' }}>
      <Table columns={columns} dataSource={usuarios} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
    </Card>
  );
} 