/**
 * ga4Analytics.js
 * ─────────────────────────────────────────────────────────────
 * Lectura de datos de Google Analytics 4 (GA4 Data API) para el
 * panel de admin — tráfico diario, resumen del período y páginas
 * más visitadas. Requiere una service account con rol "Viewer" en
 * la property de GA4 (ver GA4_CREDENTIALS_BASE64 / GA4_PROPERTY_ID).
 *
 * fallback:true fuerza transporte REST (HTTP/1.1) en vez de gRPC —
 * en algunos entornos la resolución DNS del endpoint gRPC de GA4
 * falla aunque HTTPS normal funcione perfecto.
 * ─────────────────────────────────────────────────────────────
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

let _client = null;

const isConfigured = () =>
  !!process.env.GA4_CREDENTIALS_BASE64 && !!process.env.GA4_PROPERTY_ID;

const getClient = () => {
  if (_client) return _client;
  const credentials = JSON.parse(
    Buffer.from(process.env.GA4_CREDENTIALS_BASE64, "base64").toString("utf8")
  );
  _client = new BetaAnalyticsDataClient({ credentials, fallback: true });
  return _client;
};

const property = () => `properties/${process.env.GA4_PROPERTY_ID}`;

// GA4 devuelve la fecha como "YYYYMMDD" — normalizamos a "YYYY-MM-DD"
const fmtDate = (raw) => `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;

/** Tráfico día a día: sesiones, usuarios activos, vistas, duración prom. */
export const getDailyTraffic = async (startDate = "2026-09-01", endDate = "today") => {
  if (!isConfigured()) return [];
  const [response] = await getClient().runReport({
    property: property(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "date" }],
    metrics: [
      { name: "sessions" },
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
    ],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });
  return (response.rows || []).map((row) => {
    const [sessions, users, views, avgDur] = row.metricValues.map((m) => Number(m.value));
    return {
      date: fmtDate(row.dimensionValues[0].value),
      sessions, users, views,
      avgDurationSec: Math.round(avgDur),
    };
  });
};

/** Totales del período completo + usuarios nuevos. */
export const getSummary = async (startDate = "2026-09-01", endDate = "today") => {
  if (!isConfigured()) return null;
  const [response] = await getClient().runReport({
    property: property(),
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "sessions" },
      { name: "activeUsers" },
      { name: "newUsers" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
    ],
  });
  const row = response.rows?.[0];
  if (!row) return { sessions: 0, users: 0, newUsers: 0, views: 0, avgDurationSec: 0 };
  const [sessions, users, newUsers, views, avgDur] = row.metricValues.map((m) => Number(m.value));
  return { sessions, users, newUsers, views, avgDurationSec: Math.round(avgDur) };
};

/** Páginas más visitadas del período. */
export const getTopPages = async (startDate = "2026-09-01", endDate = "today", limit = 10) => {
  if (!isConfigured()) return [];
  const [response] = await getClient().runReport({
    property: property(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit,
  });
  return (response.rows || []).map((row) => ({
    path:  row.dimensionValues[0].value,
    views: Number(row.metricValues[0].value),
    users: Number(row.metricValues[1].value),
  }));
};
