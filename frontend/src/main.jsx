import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { NutritionProvider } from "./context/NutritionContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UiPreferencesProvider } from "./context/UiPreferencesContext";
import "./i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <UiPreferencesProvider>
      <NutritionProvider>
        <App />
      </NutritionProvider>
    </UiPreferencesProvider>
  </GoogleOAuthProvider>
);
