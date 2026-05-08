import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatbotWidget from './ChatbotWidget';

export default function Layout() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
