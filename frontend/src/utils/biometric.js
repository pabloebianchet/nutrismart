/**
 * WebAuthn biometric helper — Face ID / huella como lock screen.
 * La credencial pública se registra y verifica contra el backend
 * (@simplewebauthn), que guarda la public key del usuario y valida
 * cada assertion. En el dispositivo solo se guarda un flag local.
 */
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { API_URL } from "../config/api";

const REGISTERED_FLAG = "nui_biometric_enabled";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("nutrismartToken")}`,
});

export const isBiometricSupported = () =>
  typeof window !== "undefined" &&
  typeof window.PublicKeyCredential !== "undefined" &&
  typeof navigator.credentials?.create === "function";

/**
 * Verifica si el dispositivo tiene un autenticador biométrico real
 * (Face ID, huella, Windows Hello). Devuelve una promesa.
 */
export const isPlatformAuthenticatorAvailable = async () => {
  try {
    if (!isBiometricSupported()) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

export const isBiometricRegistered = () =>
  localStorage.getItem(REGISTERED_FLAG) === "1";

export const clearBiometric = () =>
  localStorage.removeItem(REGISTERED_FLAG);

/**
 * Registra la credencial biométrica contra el backend.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export const registerBiometric = async () => {
  try {
    const optionsRes = await fetch(`${API_URL}/api/webauthn/register-options`, {
      headers: authHeaders(),
    });
    if (!optionsRes.ok) return { ok: false, error: "No se pudieron generar las opciones" };
    const options = await optionsRes.json();

    let attResp;
    try {
      attResp = await startRegistration({ optionsJSON: options });
    } catch (e) {
      if (e.name === "NotAllowedError") return { ok: false, error: "cancelled" };
      throw e;
    }

    const verifyRes = await fetch(`${API_URL}/api/webauthn/register-verify`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ response: attResp }),
    });
    const data = await verifyRes.json();
    if (!verifyRes.ok || !data.ok) return { ok: false, error: data.error || "Error desconocido" };

    localStorage.setItem(REGISTERED_FLAG, "1");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "Error desconocido" };
  }
};

/**
 * Verifica la identidad con Face ID / huella contra el backend.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export const verifyBiometric = async () => {
  try {
    const optionsRes = await fetch(`${API_URL}/api/webauthn/auth-options`, {
      headers: authHeaders(),
    });
    if (optionsRes.status === 404) {
      clearBiometric();
      return { ok: false, error: "no_registered" };
    }
    if (!optionsRes.ok) return { ok: false, error: "No se pudieron generar las opciones" };
    const options = await optionsRes.json();

    let authResp;
    try {
      authResp = await startAuthentication({ optionsJSON: options });
    } catch (e) {
      if (e.name === "NotAllowedError") return { ok: false, error: "cancelled" };
      throw e;
    }

    const verifyRes = await fetch(`${API_URL}/api/webauthn/auth-verify`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ response: authResp }),
    });
    const data = await verifyRes.json();
    if (!verifyRes.ok || !data.ok) return { ok: false, error: data.error || "Error desconocido" };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "Error desconocido" };
  }
};
