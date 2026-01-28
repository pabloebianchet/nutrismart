import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserDataPage from "./pages/UserDataPage";
import CapturePage from "./pages/CapturePage";
import ResultScreen from "./components/ResultScreen";
import AppHeader from "./components/AppHeader";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ContactPage from "./pages/ContactPage";



const App = () => {
  return (
    <Router>
      <AppHeader />
      <Routes>
        <Route path="/" element={<UserDataPage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
   
      </Routes>
    </Router>
  );
};

export default App;

