import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const LANGUAGE_KEY = "nutrismart_language";
const savedLanguage = localStorage.getItem(LANGUAGE_KEY);

const resources = {
  es: {
    translation: {
      nav: {
        home: "Inicio",
        about: "Quiénes somos",
        howItWorks: "Cómo funciona",
        contact: "Contacto",
      },
      menu: {
        settings: "Ajustes",
        language: "Idioma",
        spanish: "Español",
        english: "Inglés",
        theme: "Tema",
        light: "Modo día",
        dark: "Modo noche",
        logout: "Cerrar sesión",
      },
      home: {
        welcome: "Bienvenido a NUI",
        loginDescription:
          "Iniciá sesión con Google para analizar productos, guardar tu historial y recibir recomendaciones nutricionales claras.",
        privacy: "No compartimos tu información personal.",
        loadingProfile: "Cargando tu perfil...",
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        about: "About",
        howItWorks: "How it works",
        contact: "Contact",
      },
      menu: {
        settings: "Settings",
        language: "Language",
        spanish: "Spanish",
        english: "English",
        theme: "Theme",
        light: "Day mode",
        dark: "Night mode",
        logout: "Log out",
      },
      home: {
        welcome: "Welcome to NUI",
        loginDescription:
          "Sign in with Google to analyze products, save your history, and get clear nutrition recommendations.",
        privacy: "We do not share your personal information.",
        loadingProfile: "Loading your profile...",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage || "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem(LANGUAGE_KEY, language);
});

export default i18n;
