import { createContext, useContext, useState } from "react";

const NutritionContext = createContext();

export const NutritionProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [ocrText, setOcrText] = useState("");

  const updateUserData = (data) => setUserData(data);
  const updateOcrText = (text) => setOcrText(text);

  return (
    <NutritionContext.Provider value={{ userData, updateUserData, ocrText, updateOcrText }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => useContext(NutritionContext);
