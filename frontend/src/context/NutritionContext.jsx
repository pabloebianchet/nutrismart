import { createContext, useContext, useEffect, useRef, useState } from "react";

export const NutritionContext = createContext();

export const NutritionProvider = ({ children }) => {
  /* ======================
     AUTH STATE
  ====================== */

  const [authLoading, setAuthLoading] = useState(true);

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("nutrismartUser");
    return stored ? JSON.parse(stored) : null;
  });

  /* ======================
     USER DATA
  ====================== */

  const [userData, setUserData] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [loadingUserData, setLoadingUserData] = useState(false);

  const lastUserIdRef = useRef(null);

  /* ======================
     AUTH BOOTSTRAP
  ====================== */

  // 🔑 Marca cuándo la app terminó de resolver auth (localStorage / Google)
  useEffect(() => {
    // Si necesitás validar token / Google session, este es el lugar
    setAuthLoading(false);
  }, []);

  /* ======================
     LOCAL STORAGE SYNC
  ====================== */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("nutrismartUser");
    const nextValue = user ? JSON.stringify(user) : null;

    if (user) {
      if (stored !== nextValue) {
        window.localStorage.setItem("nutrismartUser", nextValue);
      }
    } else if (stored) {
      window.localStorage.removeItem("nutrismartUser");
    }
  }, [user]);

  /* ======================
     USER SWITCH CLEANUP
  ====================== */

  useEffect(() => {
    const currentId = user?.googleId || null;

    if (lastUserIdRef.current && lastUserIdRef.current !== currentId) {
      setUserData(null);
      setOcrText("");
    }

    lastUserIdRef.current = currentId;
  }, [user]);

  /* ======================
     FETCH USER PROFILE
  ====================== */

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.googleId) return;

      setLoadingUserData(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/profile/${user.googleId}`,
        );

        if (!res.ok) {
          if (res.status === 404) {
            setUserData({ profileCompleted: false });
            return;
          }
          throw new Error("Error cargando perfil");
        }

        const data = await res.json();
        if (data?.user) {
          setUserData(data.user);
        }
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [user?.googleId]);

  /* ======================
     PUBLIC ACTIONS
  ====================== */

  const updateUserData = (data) => {
    if (data === null) {
      setUserData(null);
      return;
    }
    setUserData((prev) => ({ ...(prev || {}), ...data }));
  };

  const updateOcrText = (text) => setOcrText(text);
  const clearOcrText = () => setOcrText("");

  const clearUser = () => {
    setUser(null);
    setUserData(null);
    setOcrText("");
  };

  const logout = () => clearUser();

  /* ======================
     PROVIDER
  ====================== */

  return (
    <NutritionContext.Provider
      value={{
        // auth
        authLoading,
        user,
        setUser,

        // profile
        userData,
        updateUserData,
        loadingUserData,

        // ocr
        ocrText,
        updateOcrText,
        clearOcrText,

        // actions
        clearUser,
        logout,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => useContext(NutritionContext);
