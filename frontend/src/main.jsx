import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { NutritionProvider } from "./context/NutritionContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";


console.log("GOOGLE CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);


ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <NutritionProvider>
      <App />
    </NutritionProvider>
  </GoogleOAuthProvider>
);
