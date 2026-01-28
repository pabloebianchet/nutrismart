import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { NutritionProvider } from "./context/NutritionContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <NutritionProvider>
      <App />
    </NutritionProvider>
  </GoogleOAuthProvider>
);
