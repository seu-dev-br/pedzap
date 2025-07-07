const light = {
  colors: {
    background: '#F7F9FC', // Branco Nuvem
    card: '#FFFFFF',
    primary: '#00C48C', // Verde Impulso como cor primária
    secondary: '#2A4D8C', // Azul Confiança como secundária
    accent: '#2FE2D5', // Ciano Ativo
    text: '#212934', // Grafite Focado
    subtitle: '#2A4D8C', // Azul Confiança
    border: '#00C48C', // Verde Impulso
    highlight: '#2FE2D5', // Ciano Ativo
    shadow: '0 8px 32px 0 rgba(0, 196, 140, 0.10)',
  },
};

const dark = {
  colors: {
    background: '#181924', // Mais escuro para fundo
    card: '#23263a', // Card escuro
    primary: '#00C48C', // Verde Impulso para botões principais
    secondary: '#2FE2D5', // Ciano Ativo para botões secundários
    accent: '#2A4D8C', // Azul Confiança para destaques
    text: '#FFFFFF', // Texto branco puro
    subtitle: '#2FE2D5', // Ciano Ativo para subtítulos
    border: '#2FE2D5', // Ciano Ativo para bordas
    highlight: '#00C48C', // Verde Impulso para highlights
    shadow: '0 8px 32px 0 rgba(0, 196, 140, 0.18)',
  },
};

const base = {
  font: {
    family: "'Inter', 'Poppins', 'Segoe UI', Arial, sans-serif",
    size: {
      base: 16,
      h1: 36,
      h2: 24,
      h3: 18,
      small: 14,
    },
    weight: {
      normal: 400,
      bold: 700,
      extrabold: 800,
    }
  },
  borderRadius: 18,
  spacing: {
    xs: 8,
    sm: 16,
    md: 32,
    lg: 40,
  }
};

export const themes = {
  light: { ...light, ...base },
  dark: { ...dark, ...base }
}; 