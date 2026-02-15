const sanitizeBaseUrl = (url) => url.replace(/\/+$/, "");

const upgradeToHttpsIfNeeded = (url) => {
  if (typeof window === "undefined") return url;

  const isHttpsPage = window.location.protocol === "https:";
  if (!isHttpsPage) return url;

  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
};

export const API_URL = (() => {
  const rawUrl = import.meta.env.VITE_API_URL?.trim();

  if (!rawUrl) {
    return "";
  }

  return sanitizeBaseUrl(upgradeToHttpsIfNeeded(rawUrl));
})();
