import React, { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { List, Button, Spin, Tabs, Form, Input, message } from 'antd';
import 'antd/dist/reset.css';

// Thunk para buscar dados
export const fetchItems = createAsyncThunk('items/fetchItems', async () => {
  const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
  return response.data;
});

// Slice Redux
const itemsSlice = createSlice({
  name: 'items',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

const store = configureStore({
  reducer: {
    items: itemsSlice.reducer,
  },
});

// Navbar fixa no topo
function Navbar({ user, onLogout, onShowAuth }) {
  return (
    <div style={{
      width: '100%',
      background: '#fff',
      borderBottom: '1px solid #e6e6e6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: 56,
      boxShadow: '0 2px 8px 0 rgba(31,38,135,0.04)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <span style={{ fontWeight: 700, fontSize: 22, color: '#222' }}>PedZap Desktop</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {!user ? (
          <Button type="primary" onClick={onShowAuth}>Entrar / Criar Conta</Button>
        ) : (
          <Button danger onClick={onLogout}>Sair</Button>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.items);
  const [authTab, setAuthTab] = React.useState('login');
  const [loadingAuth, setLoadingAuth] = React.useState(false);
  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem('pedzap_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuth, setShowAuth] = React.useState(!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pedzap_user', JSON.stringify(user));
      dispatch(fetchItems());
      setShowAuth(false);
    } else {
      localStorage.removeItem('pedzap_user');
      setShowAuth(true);
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    setUser(null);
    setShowAuth(true);
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  // Paleta de cores moderna
  const colors = {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    card: '#fff',
    primary: '#1890ff',
    secondary: '#13c2c2',
    accent: '#f5222d',
    text: '#222',
    subtitle: '#555',
    border: '#e6e6e6',
    highlight: '#e6f7ff',
  };

  // Funções de autenticação com Supabase
  const handleLogin = async (values) => {
    setLoadingAuth(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.senha,
      });
      if (error) {
        message.error(error.message || 'Erro ao logar');
      } else {
        setUser(data.user);
        localStorage.setItem('pedzap_user', JSON.stringify(data.user));
        message.success('Login realizado!');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleRegister = async (values) => {
    setLoadingAuth(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.senha,
        options: {
          data: { nome: values.nome },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) {
        message.error(error.message || 'Erro ao cadastrar');
      } else {
        message.success('Cadastro realizado! Verifique seu e-mail para ativar a conta.');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSocial = async (provider) => {
    setLoadingAuth(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) {
        message.error(error.message || 'Erro no login social');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 0,
        fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      <Navbar user={user} onLogout={handleLogout} onShowAuth={handleShowAuth} />
      <div
        style={{
          background: colors.card,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          borderRadius: 18,
          marginTop: 48,
          padding: 32,
          width: '100%',
          maxWidth: 900,
          border: `1px solid ${colors.border}`,
        }}
      >
        {showAuth ? (
          <div style={{ maxWidth: 400, margin: '0 auto 32px auto' }}>
            <Tabs
              activeKey={authTab}
              onChange={setAuthTab}
              centered
              items={[{
                key: 'login',
                label: (
                  <span>
                    <Button type={authTab === 'login' ? 'primary' : 'default'} style={{ marginRight: 8 }}>Entrar</Button>
                  </span>
                ),
                children: (
                  <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
                    <Form.Item
                      name="email"
                      label="E-mail"
                      normalize={value => value && value.trim().toLowerCase()}
                      rules={[
                        { required: true, message: 'Digite um e-mail válido' },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            // Regex simples para e-mail válido
                            const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
                            return emailRegex.test(value)
                              ? Promise.resolve()
                              : Promise.reject('Digite um e-mail válido');
                          },
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="senha"
                      label="Senha"
                      rules={[{ required: true, message: 'Digite sua senha' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loadingAuth} block>Entrar</Button>
                    </Form.Item>
                    <Button onClick={() => handleSocial('google')} block style={{ marginBottom: 8 }}>Entrar com Google</Button>
                    <Button onClick={() => handleSocial('facebook')} block>Entrar com Facebook</Button>
                  </Form>
                ),
              }, {
                key: 'register',
                label: (
                  <span>
                    <Button type={authTab === 'register' ? 'primary' : 'default'}>Criar Conta</Button>
                  </span>
                ),
                children: (
                  <>
                    <Form layout="vertical" onFinish={handleRegister} autoComplete="off" style={{marginTop: 24}}>
                      <Form.Item
                        name="nome"
                        label="Nome completo"
                        rules={[
                          { required: true, message: 'Digite seu nome completo' },
                          { min: 3, message: 'Nome muito curto' },
                          { pattern: /^[A-Za-zÀ-ú'\- ]+$/, message: 'Nome inválido' }
                        ]}
                      >
                        <Input placeholder="Ex: Maria da Silva" autoFocus />
                      </Form.Item>
                      <Form.Item
                        name="email"
                        label="E-mail"
                        normalize={value => value && value.trim().toLowerCase()}
                        rules={[
                          { required: true, message: 'Digite um e-mail válido' },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
                              return emailRegex.test(value)
                                ? Promise.resolve()
                                : Promise.reject('Digite um e-mail válido');
                            },
                          },
                        ]}
                      >
                        <Input placeholder="seu@email.com" />
                      </Form.Item>
                      <Form.Item
                        name="senha"
                        label="Senha"
                        rules={[
                          { required: true, message: 'Digite uma senha' },
                          { min: 8, message: 'Mínimo 8 caracteres' },
                          {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                            message: 'Use letras maiúsculas, minúsculas e números'
                          }
                        ]}
                      >
                        <Input.Password placeholder="Mínimo 8 caracteres, letras e números" />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loadingAuth} block style={{fontWeight:600, fontSize:16}}>Criar Conta</Button>
                      </Form.Item>
                    </Form>
                    <Button onClick={() => handleSocial('google')} block style={{ marginTop: 8, marginBottom: 8, fontWeight:600 }}>Cadastrar com Google</Button>
                  </>
                ),
              }]}
            />
          </div>
        ) : (
          <>
            <h1 style={{
              color: colors.primary,
              fontWeight: 700,
              fontSize: 32,
              marginBottom: 8,
              letterSpacing: 1,
              textAlign: 'center',
            }}>
              Dashboard de Pedidos
            </h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <p style={{
                color: colors.subtitle,
                fontSize: 16,
                margin: 0,
                textAlign: 'left',
              }}>
                Bem-vindo, {user.nome}! Visualize e analise os pedidos de todos os restaurantes de forma fácil e intuitiva.
              </p>
              <Button onClick={() => setUser(null)} danger>Sair</Button>
            </div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <h2 style={{ color: colors.secondary, fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Pedidos Recentes</h2>
                <List
                  bordered
                  style={{
                    background: colors.card,
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.07)',
                    marginBottom: 24,
                    minHeight: 320,
                    maxHeight: 400,
                    overflowY: 'auto',
                  }}
                  dataSource={items.slice(0, 10)}
                  renderItem={item => (
                    <List.Item
                      style={{
                        borderRadius: 8,
                        margin: '8px 0',
                        background: colors.highlight,
                        border: `1px solid ${colors.border}`,
                        transition: 'box-shadow 0.2s',
                      }}
                    >
                      <List.Item.Meta
                        title={<span style={{ color: colors.primary, fontWeight: 600 }}>{item.title}</span>}
                        description={<span style={{ color: colors.subtitle }}>{item.body}</span>}
                      />
                    </List.Item>
                  )}
                />
                <Button
                  onClick={() => dispatch(fetchItems())}
                  type="primary"
                  size="large"
                  style={{
                    width: '100%',
                    background: `linear-gradient(90deg, ${colors.primary} 60%, ${colors.secondary} 100%)`,
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 18,
                    boxShadow: '0 2px 8px 0 rgba(24, 144, 255, 0.10)',
                    marginTop: 8,
                  }}
                >
                  Recarregar
                </Button>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <h2 style={{ color: colors.secondary, fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Resumo Geral</h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  background: colors.highlight,
                  borderRadius: 12,
                  padding: 24,
                  border: `1px solid ${colors.border}`,
                  minHeight: 320,
                  justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 18, color: colors.text }}>
                    <b>Total de Pedidos:</b> {items.length}
                  </div>
                  <div style={{ fontSize: 18, color: colors.text }}>
                    <b>Pedidos do Dia:</b> {items.slice(0, 5).length}
                  </div>
                  <div style={{ fontSize: 18, color: colors.text }}>
                    <b>Restaurantes Ativos:</b> 5
                  </div>
                  <div style={{ fontSize: 18, color: colors.text }}>
                    <b>Produtos Vendidos:</b> {items.reduce((acc, item) => acc + 1, 0)}
                  </div>
                </div>
              </div>
            </div>
            {status === 'loading' && (
              <div style={{ textAlign: 'center', margin: '32px 0' }}>
                <Spin size="large" tip="Carregando..." />
              </div>
            )}
            {status === 'failed' && (
              <div style={{ color: colors.accent, textAlign: 'center', margin: '16px 0' }}>
                Erro: {error}
              </div>
            )}
          </>
        )}
      </div>
      <footer style={{ marginTop: 32, color: colors.subtitle, fontSize: 14, textAlign: 'center' }}>
        © {new Date().getFullYear()} PedZap. Todos os direitos reservados.
      </footer>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
