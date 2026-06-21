import { Routes, Route } from 'react-router-dom';
import LaunchGate from './components/LaunchGate';
import Layout from './components/Layout';
import VisitTracker from './components/VisitTracker';
import Home from './pages/Home';
import NewLaunch from './pages/NewLaunch';
import Artists from './pages/Artists';
import ArtistProfile from './pages/ArtistProfile';
import ArtistPortal from './pages/ArtistPortal';
import Categories from './pages/Categories';
import ArtTypeDescription from './pages/ArtTypeDescription';
import SubTypeDetail from './pages/SubTypeDetail';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/Signin';
import Profile from './pages/Profile';
import AR from './pages/AR';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Refund from './pages/Refund';
import HelpDesk from './pages/HelpDesk';
import Events from './pages/Events';
import AdminInbox from './pages/AdminInbox';
import AdminDashboard from './pages/AdminDashboard';
import ArtistChat from './pages/ArtistChat';
import Community from './pages/Community';
import ChatRooms from './pages/ChatRooms';
import Estimate from './pages/Estimate';
import ComingSoon from './pages/ComingSoon';
import Exhibition from './pages/Exhibition';
import Competition from './pages/Competition';
import Compare from './pages/Compare';

function App() {
  return (
    <LaunchGate>
    <VisitTracker />
    <Routes>
      {/* Immersive AR route renders chrome-less (no site navbar/footer/widgets). */}
      <Route path="/ar" element={<AR />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="new-launch" element={<NewLaunch />} />
        <Route path="artists" element={<Artists />} />
        <Route path="artists/:id" element={<ArtistProfile />} />
        <Route path="become-artist" element={<ArtistPortal />} />
        <Route path="compare" element={<Compare />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:medium" element={<ArtTypeDescription />} />
        <Route path="categories/:medium/:sub" element={<SubTypeDetail />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="profile" element={<Profile />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="refund" element={<Refund />} />
        <Route path="help" element={<HelpDesk />} />
        <Route path="events" element={<Events />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/inbox" element={<AdminInbox />} />
        <Route path="artist-chat" element={<ArtistChat />} />
        <Route path="community" element={<Community />} />
        <Route path="chat" element={<ChatRooms />} />
        <Route path="estimate" element={<Estimate />} />
        <Route path="exhibition" element={<Exhibition />} />
        <Route path="competition" element={<Competition />} />
        <Route path="saman-setu" element={<ComingSoon page="saman-setu" />} />
        <Route path="swad-setu" element={<ComingSoon page="swad-setu" />} />
        <Route path="sarjaan-setu" element={<ComingSoon page="sarjaan-setu" />} />
        <Route path="shilp-setu" element={<ComingSoon page="shilp-setu" />} />
        <Route path="rental" element={<ComingSoon page="rental" />} />
        <Route path="waste-management" element={<ComingSoon page="waste-management" />} />
      </Route>
    </Routes>
    </LaunchGate>
  );
}

export default App;
