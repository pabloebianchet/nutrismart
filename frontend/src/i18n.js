import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const LANGUAGE_KEY = "nutrismart_language";
const savedLanguage = localStorage.getItem(LANGUAGE_KEY);

const resources = {
  es: {
    translation: {
      nav: { home: "Inicio", about: "Quiénes somos", howItWorks: "Cómo funciona", contact: "Contacto" },
      menu: { settings: "Ajustes", language: "Idioma", spanish: "Español", english: "Inglés", italian: "Italiano", theme: "Tema", light: "Modo día", dark: "Modo noche", logout: "Cerrar sesión" },
      home: { welcome: "Bienvenido a NUI", loginDescription: "Iniciá sesión con Google para analizar productos, guardar tu historial y recibir recomendaciones nutricionales claras.", privacy: "No compartimos tu información personal.", loadingProfile: "Cargando tu perfil..." },
      about: { title: "Nutrición basada en datos reales", subtitle: "Analizamos la información nutricional declarada en los envases para convertir datos técnicos en decisiones claras.", c1t: "Análisis inteligente", c1d: "Procesamos calorías, azúcares, grasas, sodio, proteínas y más.", c2t: "Información clara", c2d: "Simplificamos tablas complejas para entender mejor lo que consumís.", c3t: "Decisiones conscientes", c3d: "Te ayudamos a tomar decisiones informadas sobre tu alimentación.", c4t: "Basado en datos declarados", c4d: "El análisis usa exclusivamente datos declarados por el fabricante." },
      how: { title: "Cómo funciona", subtitle: "Usamos IA para analizar los datos del envase y darte una evaluación objetiva.", s1t: "1. Tomás dos fotos", s1d: "Una de la tabla nutricional y otra de ingredientes.", s2t: "2. Procesamos con IA", s2d: "Interpretamos la información con criterios internacionales.", s3t: "3. Recibís una evaluación", s3d: "Obtenés una lectura clara del nivel de procesamiento.", disclaimer: "La app brinda información orientativa. No reemplaza el consejo médico." },
      contact: { title: "Contacto", subtitle: "¿Tenés alguna consulta o sugerencia? Escribinos.", fullName: "Nombre completo", email: "Correo electrónico", subject: "Asunto", message: "Mensaje", send: "Enviar mensaje", response: "Respondemos dentro de 24–48 horas hábiles." },
      capture: { imageProcessError: "No pudimos procesar la imagen.", readError: "Error al leer las imágenes.", title: "Subí las fotos del producto", subtitle: "Tabla nutricional e ingredientes.", nutritionTitle: "Tabla nutricional", nutritionDesc: "Calorías, grasas, carbohidratos, sodio.", ingredientsTitle: "Lista de ingredientes", ingredientsDesc: "Incluí todos los ingredientes y aditivos.", changePhoto: "Cambiar foto", uploadPhoto: "Tomar o subir foto", analyzing: "Analizando…", continue: "Continuar" },
      result: { title: "Resultado del análisis", subtitle: "Diagnóstico nutrimental claro y accionable.", newAnalysis: "Nuevo análisis", globalScore: "Puntaje global", healthy: "saludable", improvable: "mejorable", level: "Nivel", evalTitle: "Evaluación del producto", error: "No se pudo generar el análisis. Intentá nuevamente." },
    },
  },
  en: {
    translation: {
      nav: { home: "Home", about: "About", howItWorks: "How it works", contact: "Contact" },
      menu: { settings: "Settings", language: "Language", spanish: "Spanish", english: "English", italian: "Italian", theme: "Theme", light: "Day mode", dark: "Night mode", logout: "Log out" },
      home: { welcome: "Welcome to NUI", loginDescription: "Sign in with Google to analyze products, save your history, and get clear nutrition recommendations.", privacy: "We do not share your personal information.", loadingProfile: "Loading your profile..." },
      about: { title: "Data-driven nutrition", subtitle: "We analyze label nutrition data and turn technical values into clear decisions.", c1t: "Smart analysis", c1d: "We process calories, sugars, fats, sodium, proteins and more.", c2t: "Clear information", c2d: "We simplify complex tables to understand what you consume.", c3t: "Conscious decisions", c3d: "We help you make informed nutrition choices.", c4t: "Based on declared data", c4d: "Analysis uses only manufacturer-declared information." },
      how: { title: "How it works", subtitle: "We use AI to analyze label data and provide an objective assessment.", s1t: "1. Take two photos", s1d: "One of nutrition facts and one of ingredients.", s2t: "2. We process with AI", s2d: "We interpret data using international criteria.", s3t: "3. Get your evaluation", s3d: "You receive a clear processing-level assessment.", disclaimer: "App information is educational only and does not replace medical advice." },
      contact: { title: "Contact", subtitle: "Any question or suggestion? Write to us.", fullName: "Full name", email: "Email", subject: "Subject", message: "Message", send: "Send message", response: "We reply within 24–48 business hours." },
      capture: { imageProcessError: "We could not process the image.", readError: "Error while reading the images.", title: "Upload product photos", subtitle: "Nutrition facts and ingredients.", nutritionTitle: "Nutrition facts", nutritionDesc: "Calories, fats, carbs, sodium.", ingredientsTitle: "Ingredients list", ingredientsDesc: "Include all ingredients and additives.", changePhoto: "Change photo", uploadPhoto: "Take or upload photo", analyzing: "Analyzing…", continue: "Continue" },
      result: { title: "Analysis result", subtitle: "Clear and actionable nutrition diagnosis.", newAnalysis: "New analysis", globalScore: "Global score", healthy: "healthy", improvable: "improvable", level: "Level", evalTitle: "Product evaluation", error: "Could not generate analysis. Please try again." },
    },
  },
  it: {
    translation: {
      nav: { home: "Home", about: "Chi siamo", howItWorks: "Come funziona", contact: "Contatto" },
      menu: { settings: "Impostazioni", language: "Lingua", spanish: "Spagnolo", english: "Inglese", italian: "Italiano", theme: "Tema", light: "Modalità giorno", dark: "Modalità notte", logout: "Esci" },
      home: { welcome: "Benvenuto in NUI", loginDescription: "Accedi con Google per analizzare prodotti, salvare la cronologia e ricevere consigli nutrizionali chiari.", privacy: "Non condividiamo le tue informazioni personali.", loadingProfile: "Caricamento profilo..." },
      about: { title: "Nutrizione basata sui dati", subtitle: "Analizziamo i dati nutrizionali in etichetta per decisioni più chiare.", c1t: "Analisi intelligente", c1d: "Elaboriamo calorie, zuccheri, grassi, sodio, proteine e altro.", c2t: "Informazioni chiare", c2d: "Semplifichiamo tabelle complesse per capire meglio cosa consumi.", c3t: "Decisioni consapevoli", c3d: "Ti aiutiamo a scegliere in modo informato.", c4t: "Basato su dati dichiarati", c4d: "L'analisi usa solo informazioni dichiarate dal produttore." },
      how: { title: "Come funziona", subtitle: "Usiamo IA per analizzare i dati in etichetta e fornirti una valutazione oggettiva.", s1t: "1. Scatta due foto", s1d: "Una tabella nutrizionale e una lista ingredienti.", s2t: "2. Elaboriamo con IA", s2d: "Interpretiamo i dati con criteri internazionali.", s3t: "3. Ricevi la valutazione", s3d: "Ottieni una lettura chiara del livello di lavorazione.", disclaimer: "Le informazioni sono educative e non sostituiscono il parere medico." },
      contact: { title: "Contatto", subtitle: "Hai domande o suggerimenti? Scrivici.", fullName: "Nome completo", email: "Email", subject: "Oggetto", message: "Messaggio", send: "Invia messaggio", response: "Rispondiamo entro 24–48 ore lavorative." },
      capture: { imageProcessError: "Impossibile elaborare l'immagine.", readError: "Errore durante la lettura delle immagini.", title: "Carica le foto del prodotto", subtitle: "Tabella nutrizionale e ingredienti.", nutritionTitle: "Tabella nutrizionale", nutritionDesc: "Calorie, grassi, carboidrati, sodio.", ingredientsTitle: "Lista ingredienti", ingredientsDesc: "Includi tutti gli ingredienti e additivi.", changePhoto: "Cambia foto", uploadPhoto: "Scatta o carica foto", analyzing: "Analisi…", continue: "Continua" },
      result: { title: "Risultato dell'analisi", subtitle: "Diagnosi nutrizionale chiara e azionabile.", newAnalysis: "Nuova analisi", globalScore: "Punteggio globale", healthy: "salutare", improvable: "migliorabile", level: "Livello", evalTitle: "Valutazione del prodotto", error: "Impossibile generare l'analisi. Riprova." },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage || "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem(LANGUAGE_KEY, language);
});

export default i18n;
