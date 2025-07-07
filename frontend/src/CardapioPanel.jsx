import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, InputNumber, Select, Modal, message, Space } from 'antd';

const apiBaseUrl = 'http://localhost:3001/api';

export default function CardapioPanel() {
  const [itens, setItens] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();

  const loadItens = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/menu`);
      const data = await res.json();
      setItens(data.data || []);
    } catch (e) {
      message.error('Erro ao carregar cardápio.');
    }
    setLoading(false);
  };
  const loadCategorias = async () => {
    const res = await fetch(`${apiBaseUrl}/categories`);
    const data = await res.json();
    setCategorias(data.categories || data.data || []);
  };
  useEffect(() => {
    loadItens();
    loadCategorias();
  }, []);

  const showModal = (item = null) => {
    setEditItem(item);
    setModalVisible(true);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este item do cardápio?')) return;
    try {
      await fetch(`${apiBaseUrl}/menu/${id}`, { method: 'DELETE' });
      message.success('Item excluído com sucesso!');
      loadItens();
    } catch (e) {
      message.error('Erro ao excluir item.');
    }
  };
  const handleFinish = async (values) => {
    try {
      if (editItem) {
        await fetch(`${apiBaseUrl}/menu/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('Item editado com sucesso!');
      } else {
        await fetch(`${apiBaseUrl}/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('Item adicionado com sucesso!');
      }
      setModalVisible(false);
      loadItens();
    } catch (e) {
      message.error('Erro ao salvar item.');
    }
  };

  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => {
        const input = document.querySelector('input[name="name"]');
        if (input) input.focus();
      }, 200);
    }
  }, [modalVisible]);

  const columns = [
    { title: 'Categoria', dataIndex: 'category', key: 'category' },
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    { title: 'Preço', dataIndex: 'price', key: 'price', render: (v) => `R$ ${Number(v).toFixed(2).replace('.', ',')}` },
    { title: 'Ações', key: 'acoes', render: (_, record) => (
      <Space>
        <Button 
          size="small" 
          onClick={() => showModal(record)}
          style={{
            backgroundColor: 'var(--color-azul-confianca)',
            borderColor: 'var(--color-azul-confianca)',
            color: 'white'
          }}
        >
          Editar
        </Button>
        <Button 
          size="small" 
          onClick={() => handleDelete(record.id)}
          style={{
            backgroundColor: '#e74c3c',
            borderColor: '#e74c3c',
            color: 'white'
          }}
        >
          Excluir
        </Button>
      </Space>
    ) },
  ];

  return (
    <div>
      <h3>Gerenciamento de Cardápio</h3>
      <Button 
        type="primary" 
        onClick={() => showModal()} 
        style={{ 
          marginBottom: 16,
          backgroundColor: 'var(--color-verde-impulso)',
          borderColor: 'var(--color-verde-impulso)'
        }}
      >
        Adicionar Item
      </Button>
      <Table columns={columns} dataSource={itens} rowKey="id" loading={loading} pagination={false} style={{ minWidth: 320 }} />
      <Modal
        title={editItem ? 'Editar Item' : 'Adicionar Item'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={editItem ? 'Salvar' : 'Adicionar'}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="category" label="Categoria" rules={[{ required: true, message: 'Selecione a categoria' }]}> 
            <Select options={categorias.map(c => ({ value: c.name, label: c.name }))} />
          </Form.Item>
          <Form.Item name="name" label="Nome do Produto" rules={[{ required: true, message: 'Digite o nome' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Preço (R$)" rules={[{ required: true, message: 'Digite o preço' }]}> 
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Descrição"> 
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 