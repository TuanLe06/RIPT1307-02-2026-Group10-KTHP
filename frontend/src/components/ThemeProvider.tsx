import type { ReactNode } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import { ThemeContext, createThemeState } from '../hooks/useTheme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme, toggle } = createThemeState();

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: theme === 'dark' ? '#4da3ff' : '#007BFF',
            colorLink: theme === 'dark' ? '#4da3ff' : '#007BFF',
            colorError: '#DC3545',
            colorSuccess: '#28A745',
            colorWarning: '#FFC107',
            fontFamily: '"Inter", system-ui, sans-serif',
            borderRadius: 4,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
