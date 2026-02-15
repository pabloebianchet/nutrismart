import { createContext, useContext, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

const THEME_KEY = "nutrismart_theme_mode";

const UiPreferencesContext = createContext(null);

export const UiPreferencesProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [mode, setMode] = useState(localStorage.getItem(THEME_KEY) || "light");

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

  const setLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#0f6d63",
          },
          background:
            mode === "light"
              ? { default: "#f4fbf7", paper: "#ffffff" }
              : { default: "#0f1716", paper: "#1a2523" },
        },
        typography: {
          fontFamily: '"Nunito", system-ui, -apple-system, sans-serif',
        },
      }),
    [mode]
  );

  return (
    <UiPreferencesContext.Provider
      value={{
        mode,
        toggleMode,
        language: i18n.language,
        setLanguage,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </UiPreferencesContext.Provider>
  );
};

export const useUiPreferences = () => {
  const context = useContext(UiPreferencesContext);

  if (!context) {
    throw new Error("useUiPreferences must be used inside UiPreferencesProvider");
  }

  return context;
};
