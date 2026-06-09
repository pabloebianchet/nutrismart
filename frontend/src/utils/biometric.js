/**
 * WebAuthn biometric helper — Face ID / fingerprint como lock screen.
 */

const RP_NAME    = "Nui App";
const PASSKEY_KEY = "nui_passkey_id";

const getRpId = () => window.location.hostname;

// Codificación segura para arrays grandes
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToUint8Array = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const isBiometricSupported = () =>
  typeof window !== "undefined" &&
  typeof window.PublicKeyCredential !== "undefined" &&
  typeof navigator.credentials?.create === "function";

export const isBiometricRegistered = () =>
  !!localStorage.getItem(PASSKEY_KEY);

export const clearBiometric = () =>
  localStorage.removeItem(PASSKEY_KEY);

/**
 * Registra la credencial biométrica.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export const registerBiometric = async (userId, displayName) => {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp:   { id: getRpId(), name: RP_NAME },
        user: {
          id:          new TextEncoder().encode(String(userId).slice(0, 64)),
          name:        (displayName || "usuario").slice(0, 64),
          displayName: (displayName || "usuario").slice(0, 64),
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7   },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
      },
    });

    if (!credential) return { ok: false, error: "Sin credencial" };

    const rawId = arrayBufferToBase64(credential.rawId);
    localStorage.setItem(PASSKEY_KEY, rawId);
    return { ok: true };
  } catch (e) {
    if (e.name === "NotAllowedError") return { ok: false, error: "cancelled" };
    return { ok: false, error: e.message || "Error desconocido" };
  }
};

/**
 * Verifica la identidad con Face ID / huella.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export const verifyBiometric = async () => {
  const stored = localStorage.getItem(PASSKEY_KEY);
  if (!stored) return { ok: false, error: "no_registered" };

  try {
    const rawId     = base64ToUint8Array(stored);
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: getRpId(),
        allowCredentials: [{ type: "public-key", id: rawId, transports: ["internal"] }],
        userVerification: "required",
        timeout: 60000,
      },
    });

    return assertion ? { ok: true } : { ok: false, error: "Sin respuesta" };
  } catch (e) {
    if (e.name === "NotAllowedError") return { ok: false, error: "cancelled" };
    // Si el credential no existe más en el dispositivo, limpiarlo
    if (e.name === "InvalidStateError" || e.name === "UnknownError") {
      clearBiometric();
      return { ok: false, error: "no_registered" };
    }
    return { ok: false, error: e.message || "Error desconocido" };
  }
};
