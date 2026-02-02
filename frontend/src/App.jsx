import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserDataPage from "./pages/UserDataPage.jsx";
import CapturePage from "./pages/CapturePage.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import AppHeader from "./components/AppHeader.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
<<<<<<< HEAD
import { useLocation } from "react-router-dom";

=======
import ProfilePage from "./pages/ProfilePage.jsx";
>>>>>>> 37ef353173a3c0ae6701a817c51f2e05ac4518ce



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
   
      </Routes>
    </Router>
  );
};

export default App;
