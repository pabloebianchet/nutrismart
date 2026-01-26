import { createContext, useContext, useState } from "react";

const NutritionContext = createContext();

export const NutritionProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    sexo: "",
    edad: "",
    actividad: "",
    peso: "",
    altura: "",
  });

  const [images, setImages] = useState({
    ingredientes: null,
    tabla: null,
    soloUna: false, // si el usuario indica que tiene una imagen con todo
  });

  const [result, setResult] = useState(null); // para la respuesta de la IA

  return (
    <NutritionContext.Provider
      value={{
        userData,
        setUserData,
        images,
        setImages,
        result,
        setResult,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

// Hook para usar fácilmente el contexto en cualquier componente
export const useNutrition = () => useContext(NutritionContext);
