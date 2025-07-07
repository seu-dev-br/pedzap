import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Form, Input, Button, message } from 'antd';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ password }) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      message.error(error.message || 'Erro ao redefinir senha');
    } else {
      message.success('Senha redefinida com sucesso! Faça login novamente.');
      window.location.href = '/';
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '64px auto' }}>
      <h2>Redefinir Senha</h2>
      <Form onFinish={onFinish}>
        <Form.Item
          name="password"
          label="Nova senha"
          rules={[{ required: true, message: 'Digite a nova senha' }, { min: 8, message: 'Mínimo 8 caracteres' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Redefinir Senha
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
} 