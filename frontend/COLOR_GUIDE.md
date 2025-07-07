# Guia de Cores - PedZap
## Paleta "Confiança e Crescimento"

### Visão Geral
Esta paleta equilibra a seriedade e confiança da tecnologia (azuis e cinzas) com a energia do crescimento e ação (verdes), ancorada em uma base neutra e quente que traz proximidade e cuidado.

---

## 🎨 Cores Principais

### 1. Azul Confiança (Primária)
```css
--color-azul-confianca: #2A4D8C
```
**RGB:** 42, 77, 140

**Uso:** Cor principal da marca, cabeçalhos, navegação, elementos estruturais
- Cabeçalhos de página
- Barra de navegação
- Botões primários
- Cards de destaque
- Bordas de seções importantes

**Exemplo:**
```css
.header {
  background-color: var(--color-azul-confianca);
  color: var(--color-branco-nuvem);
}
```

---

### 2. Verde Impulso (Secundária)
```css
--color-verde-impulso: #00C48C
```
**RGB:** 0, 196, 140

**Uso:** Ações principais, confirmações, elementos de sucesso
- Botões de ação ("Fazer Pedido", "Confirmar")
- Indicadores de sucesso
- Gráficos de crescimento
- Status ativo
- Call-to-action principal

**Exemplo:**
```css
.btn-primary {
  background-color: var(--color-verde-impulso);
  color: white;
}

.success-indicator {
  color: var(--color-verde-impulso);
}
```

---

### 3. Ciano Ativo (Destaque)
```css
--color-ciano-ativo: #2FE2D5
```
**RGB:** 47, 226, 213

**Uso:** Links, notificações, informações secundárias importantes
- Links de navegação
- Ícones de notificação
- Informações complementares
- Elementos interativos secundários
- Diferenciação de elementos

**Exemplo:**
```css
.link {
  color: var(--color-ciano-ativo);
}

.notification-icon {
  color: var(--color-ciano-ativo);
}
```

---

## 🎯 Neutros

### 4. Grafite Focado (Texto)
```css
--color-grafite-focado: #212934
```
**RGB:** 33, 41, 52

**Uso:** Texto principal, títulos, conteúdo legível
- Texto do corpo
- Títulos e subtítulos
- Labels de formulários
- Conteúdo principal
- Elementos que precisam de máxima legibilidade

**Exemplo:**
```css
body {
  color: var(--color-grafite-focado);
}

h1, h2, h3 {
  color: var(--color-grafite-focado);
}
```

---

### 5. Branco Nuvem (Fundo)
```css
--color-branco-nuvem: #F7F9FC
```
**RGB:** 247, 249, 252

**Uso:** Fundos, espaços em branco, contraste
- Fundo principal da aplicação
- Cards e containers
- Espaços de respiro
- Elementos que precisam de contraste

**Exemplo:**
```css
body {
  background-color: var(--color-branco-nuvem);
}

.card {
  background-color: var(--color-branco-nuvem);
}
```

---

## 📋 Casos de Uso Práticos

### Botões
```css
/* Botão Primário */
.btn-primary {
  background-color: var(--color-verde-impulso);
  color: white;
  border: none;
}

/* Botão Secundário */
.btn-secondary {
  background-color: var(--color-azul-confianca);
  color: var(--color-branco-nuvem);
  border: none;
}

/* Botão Outline */
.btn-outline {
  background-color: transparent;
  color: var(--color-azul-confianca);
  border: 2px solid var(--color-azul-confianca);
}
```

### Cards e Containers
```css
.card {
  background-color: var(--color-branco-nuvem);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.card-header {
  background-color: var(--color-azul-confianca);
  color: var(--color-branco-nuvem);
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
}
```

### Formulários
```css
.form-input {
  border: 2px solid #e0e0e0;
  color: var(--color-grafite-focado);
  background-color: var(--color-branco-nuvem);
}

.form-input:focus {
  border-color: var(--color-azul-confianca);
  outline: none;
}

.form-label {
  color: var(--color-grafite-focado);
  font-weight: 500;
}
```

### Status e Indicadores
```css
.status-success {
  color: var(--color-verde-impulso);
  background-color: rgba(0, 196, 140, 0.1);
}

.status-info {
  color: var(--color-ciano-ativo);
  background-color: rgba(47, 226, 213, 0.1);
}

.status-warning {
  color: #f39c12;
  background-color: rgba(243, 156, 18, 0.1);
}

.status-error {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}
```

---

## 🎨 Variações e Opacidades

### Versões com Transparência
```css
/* Azul com 10% de opacidade para fundos sutis */
.azul-bg-subtle {
  background-color: rgba(42, 77, 140, 0.1);
}

/* Verde com 20% de opacidade para highlights */
.verde-highlight {
  background-color: rgba(0, 196, 140, 0.2);
}

/* Ciano com 15% de opacidade para hover states */
.ciano-hover:hover {
  background-color: rgba(47, 226, 213, 0.15);
}
```

### Gradientes
```css
.gradient-primary {
  background: linear-gradient(135deg, var(--color-azul-confianca), var(--color-ciano-ativo));
}

.gradient-success {
  background: linear-gradient(135deg, var(--color-verde-impulso), var(--color-ciano-ativo));
}
```

---

## 📱 Responsividade e Acessibilidade

### Contraste
- **Azul Confiança + Branco Nuvem:** Contraste excelente ✅
- **Verde Impulso + Branco:** Contraste excelente ✅
- **Grafite Focado + Branco Nuvem:** Contraste excelente ✅

### Estados Interativos
```css
.btn-primary:hover {
  background-color: #00b37a; /* Verde mais escuro */
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.link:hover {
  color: #1bc4b8; /* Ciano mais escuro */
  text-decoration: underline;
}
```

---

## 🚀 Implementação

### 1. Importar Variáveis
As variáveis já estão definidas em `src/index.css`:
```css
:root {
  --color-azul-confianca: #2A4D8C;
  --color-verde-impulso: #00C48C;
  --color-ciano-ativo: #2FE2D5;
  --color-grafite-focado: #212934;
  --color-branco-nuvem: #F7F9FC;
}
```

### 2. Usar em Componentes
```jsx
// Exemplo de uso em React
const Button = ({ variant = 'primary', children, ...props }) => {
  const buttonClass = `btn btn-${variant}`;
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};
```

### 3. Manutenção
- Sempre use as variáveis CSS, nunca valores hex diretos
- Para novas cores, adicione à paleta e documente aqui
- Teste contraste em diferentes dispositivos
- Mantenha consistência em toda a aplicação

---

## 📊 Checklist de Implementação

- [ ] Cabeçalhos usando Azul Confiança
- [ ] Botões de ação usando Verde Impulso
- [ ] Links usando Ciano Ativo
- [ ] Texto principal usando Grafite Focado
- [ ] Fundos usando Branco Nuvem
- [ ] Estados hover implementados
- [ ] Contraste testado
- [ ] Responsividade verificada
- [ ] Documentação atualizada

---

*Este guia deve ser atualizado conforme a evolução do projeto e feedback dos usuários.* 