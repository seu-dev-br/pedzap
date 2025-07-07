import React, { useState, useRef } from 'react';
import { Card, Descriptions, Button, Input, message, Form, Avatar, Upload, Spin } from 'antd';
import { supabase } from './supabaseClient';
import { UploadOutlined } from '@ant-design/icons';

export default function ConfiguracoesPanel({ user }) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(user?.user_metadata?.nome || '');
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef();

  const handleSalvar = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { nome } });
    setLoading(false);
    if (error) {
      message.error('Erro ao atualizar nome: ' + error.message);
    } else {
      message.success('Nome atualizado com sucesso!');
      setEditando(false);
      window.location.reload();
    }
  };

  const handleAvatarChange = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const userId = user.id;
      const ext = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${ext}`;
      // Upload para o bucket avatars
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      // Gerar URL pública (ou signed se bucket for privado)
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const url = data.publicUrl;
      // Atualizar no perfil
      const { error: metaError } = await supabase.auth.updateUser({ data: { avatar_url: url } });
      if (metaError) throw metaError;
      setAvatarUrl(url);
      message.success('Avatar atualizado!');
    } catch (e) {
      message.error('Erro ao enviar avatar: ' + (e.message || e.error_description));
    }
    setUploading(false);
  };

  return (
    <Card title="Configurações do Usuário" style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Avatar size={64} src={avatarUrl} style={{ backgroundColor: 'var(--color-azul-confianca)', fontSize: 32 }}>
          {user?.user_metadata?.nome?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Upload
          showUploadList={false}
          beforeUpload={file => { handleAvatarChange(file); return false; }}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />} loading={uploading}>Alterar imagem</Button>
        </Upload>
      </div>
      <Descriptions column={1}>
        <Descriptions.Item label="Nome">
          {editando ? (
            <Form layout="inline" onFinish={handleSalvar} style={{ display: 'flex', gap: 8 }}>
              <Input value={nome} onChange={e => setNome(e.target.value)} style={{ width: 180 }} />
                        <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{
              backgroundColor: 'var(--color-verde-impulso)',
              borderColor: 'var(--color-verde-impulso)'
            }}
          >
            Salvar
          </Button>
          <Button 
            onClick={() => { setEditando(false); setNome(user?.user_metadata?.nome || ''); }}
            style={{
              backgroundColor: 'var(--color-azul-confianca)',
              borderColor: 'var(--color-azul-confianca)',
              color: 'white'
            }}
          >
            Cancelar
          </Button>
            </Form>
          ) : (
            <span>
              {user?.user_metadata?.nome || '-'} 
              <Button 
                size="small" 
                onClick={() => setEditando(true)}
                style={{
                  backgroundColor: 'var(--color-ciano-ativo)',
                  borderColor: 'var(--color-ciano-ativo)',
                  color: 'white',
                  marginLeft: 8
                }}
              >
                Editar
              </Button>
            </span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="E-mail">{user?.email}</Descriptions.Item>
        <Descriptions.Item label="Tipo de Conta">{user?.user_metadata?.tipo || '-'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
} 