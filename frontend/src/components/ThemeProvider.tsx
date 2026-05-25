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
            colorPrimary: theme === 'dark' ? '#84cfff' : '#00658e',
            colorLink: theme === 'dark' ? '#84cfff' : '#00658e',
            colorError: '#C23934',
            colorSuccess: '#04844B',
            colorWarning: '#FF9A3C',
            fontFamily: '"Nunito Sans", sans-serif',
            borderRadius: 4,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
