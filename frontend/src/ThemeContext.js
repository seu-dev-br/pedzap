import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { themes } from './theme';
import { ConfigProvider, theme as antdTheme } from 'antd';

const ThemeContext = createContext({
  theme: themes.light,
  mode: 'light',
  toggleTheme: () => {}
});

function getInitialMode() {
  // 1. Verifica localStorage
  const saved = localStorage.getItem('themeMode');
  if (saved === 'light' || saved === 'dark') return saved;
  // 2. Detecta preferência do SO
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  // Salva preferência no localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Atualiza automaticamente se o SO mudar
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const value = useMemo(() => ({
    theme: themes[mode],
    mode,
    toggleTheme
  }), [mode]);

  // Integração com Ant Design
  const antdThemeConfig = {
    token: {
      colorPrimary: themes[mode].colors.primary,
      colorBgBase: themes[mode].colors.card,
      colorTextBase: themes[mode].colors.text,
      borderRadius: themes[mode].borderRadius,
      fontFamily: themes[mode].font.family,
    },
    algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdThemeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 