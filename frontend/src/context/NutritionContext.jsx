import { createContext, useContext, useEffect, useRef, useState } from "react";
import { API_URL } from "../config/api";

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
     SUBSCRIPTION STATE
  ====================== */

  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  /* ======================
     AUTH BOOTSTRAP
  ====================== */

  useEffect(() => {
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
    const currentId = user?._id || user?.googleId || null;

    if (lastUserIdRef.current && lastUserIdRef.current !== currentId) {
      setUserData(null);
      setOcrText("");
      setSubscription(null);
    }

    lastUserIdRef.current = currentId;
  }, [user]);

  /* ======================
     FETCH USER PROFILE
  ====================== */

  useEffect(() => {
    const fetchUserData = async () => {
      const identifier = user?._id || user?.googleId;
      if (!identifier) return;

      setLoadingUserData(true);
      try {
        const token = localStorage.getItem("nutrismartToken");
        const res = await fetch(
          `${API_URL}/api/user/profile/${identifier}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok) {
          if (res.status === 404) {
            setUserData({ profileCompleted: false });
            return;
          }
          if (res.status === 401) {
            localStorage.removeItem("nutrismartToken");
            localStorage.removeItem("nutrismartUser");
            setUser(null);
            setUserData(null);
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
  }, [user?._id, user?.googleId]);

  /* ======================
     FETCH SUBSCRIPTION
  ====================== */

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?._id) {
        setSubscription(null);
        return;
      }
      setLoadingSubscription(true);
      try {
        const token = localStorage.getItem("nutrismartToken");
        const res = await fetch(`${API_URL}/api/payments/subscription`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSubscription(data.subscription || null);
      } catch {
        setSubscription(null);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [user?._id]);

  /* ======================
     COMPUTED SUBSCRIPTION
  ====================== */

  const subPlan      = subscription?.plan   || null;
  const subStatus    = subscription?.status || null;
  const subEndDate   = subscription?.endDate ? new Date(subscription.endDate) : null;

  // El trial expiró si el plan es free y la fecha de fin ya pasó
  const isTrialExpired = subPlan === "free" && subStatus === "expired";

  // Una suscripción de pago (silver/gold) venció o fue cancelada Y ya pasó el período
  // Si está "cancelled" pero endDate es futuro, el usuario sigue teniendo acceso
  const isSubscriptionExpired =
    (subPlan === "silver" || subPlan === "gold") &&
    (subStatus === "expired" ||
      (subStatus === "cancelled" && (!subEndDate || subEndDate < new Date())));

  // Días que quedan en el trial (solo cuando free + activo)
  const trialDaysLeft = subPlan === "free" && subStatus === "active" && subEndDate
    ? Math.max(0, Math.ceil((subEndDate - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  // ¿Tiene acceso completo? (free activo, silver activo, gold activo)
  const hasActiveAccess = subStatus === "active" && !isTrialExpired;

  /* ======================
     PUBLIC ACTIONS
  ====================== */

  const updateUserData = (data) => {
    if (data === null) { setUserData(null); return; }
    setUserData((prev) => ({ ...(prev || {}), ...data }));
  };

  const updateOcrText = (text) => setOcrText(text);
  const clearOcrText  = () => setOcrText("");

  const clearUser = () => {
    setUser(null);
    setUserData(null);
    setOcrText("");
    setSubscription(null);
  };

  const logout = () => clearUser();

  const refreshSubscription = async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem("nutrismartToken");
      const res = await fetch(`${API_URL}/api/payments/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscription(data.subscription || null);
    } catch { /* silencioso */ }
  };

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

        // subscription
        subscription,
        loadingSubscription,
        subPlan,
        subStatus,
        subEndDate,
        isTrialExpired,
        isSubscriptionExpired,
        trialDaysLeft,
        hasActiveAccess,
        refreshSubscription,

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
