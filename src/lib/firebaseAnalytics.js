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
  apiKey: "AIzaSyB7rkLT_XZjhhMAfdTSVuXzeYyAJJ9umvk",
  authDomain: "tagscreenwin.firebaseapp.com",
  databaseURL: "https://tagscreenwin-default-rtdb.firebaseio.com",
  projectId: "tagscreenwin",
  storageBucket: "tagscreenwin.firebasestorage.app",
  messagingSenderId: "428382701077",
  appId: "1:428382701077:web:a67f0e0ad89339bf91701c",
  measurementId: "G-K0WFV4949D"
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

function isDebugMode() {
  return typeof window !== "undefined" &&
    window.localStorage?.getItem("analytics_debug") === "true";
}

export async function trackEvent(name, params = {}) {
  const safe = safeParams(params);

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
