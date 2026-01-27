import { createContext, useContext, useEffect, useState } from "react";

export const NutritionContext = createContext(); // 

export const NutritionProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = window.localStorage.getItem("nutrismartUser");
    return stored ? JSON.parse(stored) : null;
  });

  const updateUserData = (data) => setUserData(data);
  const updateOcrText = (text) => setOcrText(text);
  const clearOcrText = () => setOcrText("");
  const clearUser = () => setUser(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (user) {
      window.localStorage.setItem("nutrismartUser", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("nutrismartUser");
    }
  }, [user]);

  return (
    <NutritionContext.Provider
      value={{
        userData,
        updateUserData,
        ocrText,
        updateOcrText,
        clearOcrText,
        user,
        setUser,
        clearUser,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => useContext(NutritionContext);
