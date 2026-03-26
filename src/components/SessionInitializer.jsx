import { useEffect } from "react";
import { useSession } from "../context/Session/SessionContext";
import {
  identifyAnalyticsUser,
  setAnalyticsProfile,
  trackEvent,
} from "../lib/firebaseAnalytics";

function parseBrowserFromUserAgent() {
  const ua = navigator.userAgent || "";
  const patterns = [
    { name: "Edge", regex: /Edg\/(\d+(\.\d+)?)/i },
    { name: "Chrome", regex: /Chrome\/(\d+(\.\d+)?)/i },
    { name: "Firefox", regex: /Firefox\/(\d+(\.\d+)?)/i },
    { name: "Safari", regex: /Version\/(\d+(\.\d+)?).*Safari/i },
  ];

  for (const pattern of patterns) {
    const match = ua.match(pattern.regex);
    if (match) {
      return { browser: pattern.name, browserVersion: match[1] };
    }
  }

  return { browser: "Unknown", browserVersion: "unknown" };
}

function parseBrowser() {
  const ua = navigator.userAgent || "";
  const patterns = [
    { name: "Edge", re: /Edg\/(\d+(\.\d+)?)/i },
    { name: "Chrome", re: /Chrome\/(\d+(\.\d+)?)/i },
    { name: "Firefox", re: /Firefox\/(\d+(\.\d+)?)/i },
    { name: "Safari", re: /Version\/(\d+(\.\d+)?).*Safari/i },
  ];
  for (const p of patterns) {
    const m = ua.match(p.re);
    if (m) return { browser: p.name, browserVersion: m[1] };
  }
  return { browser: "Unknown", browserVersion: "unknown" };
}

export function SessionInitializer() {
  const { sessionId, setSessionId } = useSession();

  useEffect(() => {
    if (sessionId) return;
    const controller = new AbortController();
    const browserInfo = parseBrowser();
    const browser =
      navigator.userAgentData?.brands?.[0]?.brand || browserInfo.browser;
    const browserVersion =
      navigator.userAgentData?.brands?.[0]?.version || browserInfo.browserVersion;
    const os = navigator.userAgentData?.platform || navigator.platform || "unknown";
    const deviceType = /Mobi/.test(navigator.userAgent) ? "smartphone" : "desktop";
    const language = navigator.language;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
    const connectionTimestamp = new Date().toISOString();

    (async () => {
      const existing = localStorage.getItem("sessionId");
      if (existing) {
        setSessionId(existing);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_MAIN_URL}sessions/start`,
          {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              device: { browser, browserVersion, os, deviceType, language },
            }),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

        const data = await res.json();
        if (!data.success || !data.session_id) {
          throw new Error("Respuesta invalida: falta session_id");
        }

        localStorage.setItem("sessionId", data.session_id);
        setSessionId(data.session_id);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("No se pudo iniciar la sesion:", err);
        }
      }

    })();
    return () => controller.abort();
  }, [sessionId, setSessionId]);

  return null;
}
