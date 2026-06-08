/**
 * WebAuthn biometric helper — Face ID / fingerprint como lock screen.
 * No requiere cambios en el backend: la biometría solo desbloquea
 * la sesión ya guardada en localStorage, no genera un nuevo token.
 */

const RP_NAME = "Nui App";
const PASSKEY_KEY = "nui_passkey_id";

const getRpId = () => window.location.hostname;

export const isBiometricSupported = () =>
  typeof window !== "undefined" &&
  typeof window.PublicKeyCredential !== "undefined" &&
  typeof navigator.credentials?.create === "function";

export const isBiometricRegistered = () =>
  !!localStorage.getItem(PASSKEY_KEY);

export const clearBiometric = () =>
  localStorage.removeItem(PASSKEY_KEY);

/**
 * Registra la credencial biométrica del dispositivo.
 * Llamar justo después de un login exitoso.
 */
export const registerBiometric = async (userId, displayName) => {
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp:   { id: getRpId(), name: RP_NAME },
      user: {
        id:          new TextEncoder().encode(String(userId)),
        name:        displayName || "usuario",
        displayName: displayName || "usuario",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7   }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // solo Face ID / huella del dispositivo
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
    },
  });

  if (!credential) return false;

  const rawId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  localStorage.setItem(PASSKEY_KEY, rawId);
  return true;
};

/**
 * Verifica la identidad con Face ID / huella.
 * Devuelve true si el usuario pasó la verificación biométrica.
 */
export const verifyBiometric = async () => {
  const stored = localStorage.getItem(PASSKEY_KEY);
  if (!stored) return false;

  const rawId    = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
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

  return !!assertion;
};
