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
            colorPrimary: theme === 'dark' ? '#84cfff' : '#0143b5',
            colorLink: theme === 'dark' ? '#84cfff' : '#0143b5',
            colorError: '#C23934',
            colorSuccess: '#04844B',
            colorWarning: '#F59E0B',
            fontFamily: '"Montserrat", Helvetica, Arial, Noto Sans, sans-serif',
            borderRadius: 8,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
