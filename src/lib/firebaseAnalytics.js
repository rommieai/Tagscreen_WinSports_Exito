import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAnalytics,
  isSupported,
  logEvent,
  setUserId,
  setUserProperties,
} from "firebase/analytics";

/* const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}; */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB7rkLT_XZjhhMAfdTSVuXzeYyAJJ9umvk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tagscreenwin.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://tagscreenwin-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tagscreenwin",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tagscreenwin.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "428382701077",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:428382701077:web:a67f0e0ad89339bf91701c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K0WFV4949D",
};

let appInstance = null;
let analyticsInstance = null;
let analyticsInitPromise = null;

export function getFirebaseApp() {
  if (appInstance) return appInstance;
  appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return appInstance;
}

function sanitize(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") return value.slice(0, 100);
  return value;
}

function safeParams(params = {}) {
  const next = {};
  Object.entries(params).forEach(([k, v]) => {
    next[k] = sanitize(v);
  });
  return next;
}

export async function initFirebaseAnalytics() {
  if (analyticsInstance) return analyticsInstance;
  if (!firebaseConfig.measurementId) return null;

  if (!analyticsInitPromise) {
    analyticsInitPromise = (async () => {
      const supported = await isSupported();
      if (!supported) return null;
      analyticsInstance = getAnalytics(getFirebaseApp());
      return analyticsInstance;
    })();
  }

  try {
    return await analyticsInitPromise;
  } catch {
    analyticsInitPromise = null;
    return null;
  }
}

const _BACKEND_URL = (import.meta.env.VITE_API_MAIN_URL || '/api/').replace(/\/$/, '') + '/analytics/track';
const _ANALYTICS_ENV = import.meta.env.VITE_ANALYTICS_ENV || 'juego';
const _MATCH_ID = import.meta.env.VITE_MATCH_ID || undefined;

// Runtime env override — set by page-level code (e.g. Azteca sets 'azteca').
// null means fall back to the build-time VITE_ANALYTICS_ENV.
let _runtimeEnv = null;

export function setAnalyticsEnv(env) {
  _runtimeEnv = env;
}

function postToBackend(name, params = {}) {
  const { session_id, ...rest } = params;
  const properties = { ...rest };
  if (_MATCH_ID) properties.match_id = _MATCH_ID;

  fetch(_BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: name,
      session_id: session_id || undefined,
      properties,
      client_time: new Date().toISOString(),
      env: _runtimeEnv ?? _ANALYTICS_ENV,
    }),
  }).catch(() => {});
}

function isDebugMode() {
  return typeof window !== "undefined" &&
    window.localStorage?.getItem("analytics_debug") === "true";
}

export async function trackEvent(name, params = {}) {
  const safe = safeParams(params);

  postToBackend(name, safe);

  if (import.meta.env.DEV || isDebugMode()) {
    console.log(
      `%c[Analytics] ${name}`,
      "color: #4CAF50; font-weight: bold;",
      safe
    );
  }

  const analytics = await initFirebaseAnalytics();
  if (!analytics) return;

  logEvent(analytics, name, isDebugMode() ? { ...safe, debug_mode: true } : safe);
}

export async function identifyAnalyticsUser(sessionId) {
  if (!sessionId) return;
  const analytics = await initFirebaseAnalytics();
  if (!analytics) return;
  setUserId(analytics, sessionId);
}

export async function setAnalyticsProfile(properties = {}) {
  const analytics = await initFirebaseAnalytics();
  if (!analytics) return;
  setUserProperties(analytics, safeParams(properties));
}
