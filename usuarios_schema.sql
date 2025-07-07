-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'free', -- 'free' ou 'premium'
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para sessões de autenticação
CREATE TABLE IF NOT EXISTS sessoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  expira_em DATETIME,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
