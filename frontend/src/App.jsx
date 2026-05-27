import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";

import LandingPage       from "./pages/LandingPage.jsx";
import UserDataPage      from "./pages/UserDataPage.jsx";
import CapturePage       from "./pages/CapturePage.jsx";
import ResultScreen      from "./components/ResultScreen.jsx";
import AppHeader         from "./components/AppHeader.jsx";

import AboutPage         from "./pages/AboutPage.jsx";
import HowItWorksPage    from "./pages/HowItWorksPage.jsx";
import ContactPage       from "./pages/ContactPage.jsx";
import ProfilePage       from "./pages/ProfilePage.jsx";
import AdminDashboard    from "./pages/AdminDashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage  from "./pages/ResetPasswordPage.jsx";
import PricingPage       from "./pages/PricingPage.jsx";
import SubscriptionPage  from "./pages/SubscriptionPage.jsx";
import RecipesPage       from "./pages/RecipesPage.jsx";
import TrainingPage      from "./pages/TrainingPage.jsx";
import PrivacyPage       from "./pages/PrivacyPage.jsx";
import TermsPage         from "./pages/TermsPage.jsx";
import LegalPage         from "./pages/LegalPage.jsx";
import FloatingAnalyzeButton from "./components/FloatingAnalyzeButton.jsx";
import AppFooter         from "./components/AppFooter.jsx";
import TrialGate         from "./components/TrialGate.jsx";
import PWAInstallPrompt  from "./components/PWAInstallPrompt.jsx";
import { useNutrition }  from "./context/NutritionContext.jsx";

/* ── Gate: perfil no completado ─────────────────────────────── */
/*
 * Si el usuario está logueado pero NO completó el formulario de datos
 * personales, lo redirige a /profile desde cualquier ruta protegida.
 */
const PROFILE_FREE_PATHS = [
  "/profile", "/pricing", "/about", "/how-it-works", "/contact",
  "/privacidad", "/terminos", "/legal", "/admin",
  "/forgot-password", "/reset-password", "/",
];

const ProfileGate = () => {
  const { user, userData, loadingUserData } = useNutrition();
  const location = useLocation();

  // Esperar a que userData se cargue
  if (!user || loadingUserData || userData === null) return null;
  // Si ya completó el perfil, todo ok
  if (userData.profileCompleted) return null;
  // En rutas permitidas sin perfil, no redirigir
  if (PROFILE_FREE_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"))) return null;

  // Redirigir a /profile
  return <Navigate to="/profile" replace />;
};

/* ── Banner de prueba activa ────────────────────────────────── */
const BANNER_HIDDEN_PATHS = ["/", "/pricing", "/privacidad", "/terminos", "/legal", "/contact", "/forgot-password", "/reset-password"];

const TrialBanner = () => {
  const { user, subPlan, subStatus, trialDaysLeft } = useNutrition();
  const navigate  = useNavigate();
  const location  = useLocation();

  if (!user) return null;
  if (subPlan !== "free" || subStatus !== "active") return null;
  if (BANNER_HIDDEN_PATHS.some((p) => location.pathname.startsWith(p))) return null;

  const urgente = trialDaysLeft <= 2;

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: 56, md: 64 },   // debajo del AppHeader
        left: 0,
        right: 0,
        zIndex: 1200,
        bgcolor: urgente ? "#B71C1C" : "#0B5E55",
        py: 0.75,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
      }}
    >
      <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: "#fff", fontWeight: 600, lineHeight: 1.4, textAlign: "center" }}>
        {urgente
          ? `⏰ Tu prueba gratuita vence ${trialDaysLeft === 0 ? "hoy" : `en ${trialDaysLeft} día${trialDaysLeft !== 1 ? "s" : ""}`} —`
          : `🎉 Prueba gratuita activa — ${trialDaysLeft} día${trialDaysLeft !== 1 ? "s" : ""} restante${trialDaysLeft !== 1 ? "s" : ""} —`
        }
        {" "}
        <Box
          component="span"
          onClick={() => navigate("/pricing")}
          sx={{ fontWeight: 800, cursor: "pointer", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          Ver planes
        </Box>
      </Typography>
    </Box>
  );
};

/* ── HomeRoute: landing para visitantes, dashboard para logueados ── */
const HomeRoute = () => {
  const { user, authLoading } = useNutrition();
  if (authLoading) return null;
  return user ? <UserDataPage /> : <LandingPage />;
};

/* ── Ocultar chrome de app en la landing ──────────────────────── */
const AppChrome = () => {
  const { user } = useNutrition();
  const location = useLocation();
  const isLanding = !user && (location.pathname === "/" || location.pathname === "");
  if (isLanding) return null;
  return (
    <>
      <AppHeader />
      <ProfileGate />
      <TrialBanner />
      <TrialGate />
      <FloatingAnalyzeButton />
      <PWAInstallPrompt />
    </>
  );
};

const AppFooterConditional = () => {
  const { user } = useNutrition();
  const location = useLocation();
  const isLanding = !user && (location.pathname === "/" || location.pathname === "");
  if (isLanding) return null;
  return <AppFooter />;
};

/* ── App ──────────────────────────────────────────────────────── */
const App = () => {
  return (
    <Router>
      <AppChrome />
      <Routes>
        <Route path="/"                       element={<HomeRoute />} />
        <Route path="/login"                  element={<UserDataPage />} />
        <Route path="/capture"                element={<CapturePage />} />
        <Route path="/result"                 element={<ResultScreen />} />
        <Route path="/profile"                element={<ProfilePage />} />
        <Route path="/about"                  element={<AboutPage />} />
        <Route path="/how-it-works"           element={<HowItWorksPage />} />
        <Route path="/contact"                element={<ContactPage />} />
        <Route path="/admin"                  element={<AdminDashboard />} />
        <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token"  element={<ResetPasswordPage />} />
        <Route path="/pricing"                element={<PricingPage />} />
        <Route path="/subscription"           element={<SubscriptionPage />} />
        <Route path="/subscription/success"   element={<SubscriptionPage />} />
        <Route path="/recipes"                element={<RecipesPage />} />
        <Route path="/training"               element={<TrainingPage />} />
        <Route path="/privacidad"             element={<PrivacyPage />} />
        <Route path="/terminos"               element={<TermsPage />} />
        <Route path="/legal"                  element={<LegalPage />} />
      </Routes>
      <AppFooterConditional />
    </Router>
  );
};

export default App;
