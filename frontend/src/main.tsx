import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00658e',
          colorLink: '#00658e',
          colorError: '#C23934',
          colorSuccess: '#04844B',
          colorWarning: '#FF9A3C',
          fontFamily: '"Nunito Sans", sans-serif',
          borderRadius: 4,
        },
      }}
    >
      <BrowserRouter>
        <AntApp>
          <App />
        </AntApp>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
);
