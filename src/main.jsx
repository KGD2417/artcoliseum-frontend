import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LocaleProvider } from './context/Locale';
import { AuthProvider } from './context/Auth';
import { ChatNotificationsProvider } from './context/ChatNotifications';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatNotificationsProvider>
          <LocaleProvider>
            <App />
          </LocaleProvider>
        </ChatNotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
