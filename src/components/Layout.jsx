import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatbotWidget from './ChatbotWidget';
import MessagesWidget from './MessagesWidget';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <ScrollToTop />
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
      <MessagesWidget />
    </div>
  );
}
