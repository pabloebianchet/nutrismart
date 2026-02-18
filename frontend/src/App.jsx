import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import UserDataPage from "./pages/UserDataPage.jsx";
import CapturePage from "./pages/CapturePage.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import AppHeader from "./components/AppHeader.jsx";

import AboutPage from "./pages/AboutPage.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboard from "./pages/AdminDashboard";


const App = () => {
  return (
    <Router>
      <AppHeader />
      <Routes>
        <Route path="/" element={<UserDataPage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
