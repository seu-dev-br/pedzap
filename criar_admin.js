// Script para criar um usuário admin no Supabase via Node.js
// ATENÇÃO: Nunca exponha sua service_role key no frontend!
// Execute este script localmente, fora do frontend, com Node.js

const { createClient } = require('@supabase/supabase-js');

// Substitua pelos dados do seu projeto Supabase
const SUPABASE_URL = 'https://efvbgcbfbbrggyzdjwhf.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdmJnY2JmYmJyZ2d5emRqd2hmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgwNjQ5MywiZXhwIjoyMDY3MzgyNDkzfQ.bW5YDS_nnJ2Sgk-qoWE5PP74scfLk7RgrqTz9Evt4us';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Edite aqui os dados do novo admin
const novoUsuario = {
  email: 'admin@pedzap.com',
  password: 'Admin1234', // Troque por uma senha forte
  user_metadata: {
    nome: 'Administrador',
    tipo: 'admin'
  }
};

async function criarAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: novoUsuario.email,
    password: novoUsuario.password,
    user_metadata: novoUsuario.user_metadata,
    email_confirm: true // já confirma o e-mail
  });

  if (error) {
    console.error('Erro ao criar admin:', error);
  } else {
    console.log('Usuário admin criado:', data);
  }
}

criarAdmin();
