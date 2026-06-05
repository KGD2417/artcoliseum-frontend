import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatbotWidget from './ChatbotWidget';
import MessagesWidget from './MessagesWidget';
import ScrollToTop from './ScrollToTop';
import CompetitionLive from './CompetitionLive';
import CompareTray from './CompareTray';

export default function Layout() {
  const location = useLocation();
  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <ScrollToTop />
      <Navigation />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ChatbotWidget />
      <MessagesWidget />
      <CompetitionLive />
      <CompareTray />
    </div>
  );
}
