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
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import RecipesPage    from "./pages/RecipesPage.jsx";
import TrainingPage   from "./pages/TrainingPage.jsx";
import PrivacyPage    from "./pages/PrivacyPage.jsx";
import TermsPage      from "./pages/TermsPage.jsx";
import LegalPage      from "./pages/LegalPage.jsx";
import FloatingAnalyzeButton from "./components/FloatingAnalyzeButton.jsx";
import AppFooter      from "./components/AppFooter.jsx";


const App = () => {
  return (
    <Router>
      <AppHeader />
      <FloatingAnalyzeButton />
      <Routes>
        <Route path="/" element={<UserDataPage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/subscription/success" element={<SubscriptionPage />} />
        <Route path="/recipes"    element={<RecipesPage />} />
        <Route path="/training"   element={<TrainingPage />} />
        <Route path="/privacidad" element={<PrivacyPage />} />
        <Route path="/terminos"   element={<TermsPage />} />
        <Route path="/legal"      element={<LegalPage />} />
      </Routes>
      <AppFooter />
    </Router>
  );
};

export default App;
