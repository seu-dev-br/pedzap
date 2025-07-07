-- Tabela de restaurantes
CREATE TABLE IF NOT EXISTS restaurantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurante_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  preco REAL NOT NULL,
  categoria TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurante_id INTEGER NOT NULL,
  cliente_nome TEXT,
  valor_total REAL NOT NULL,
  status TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario REAL NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);
