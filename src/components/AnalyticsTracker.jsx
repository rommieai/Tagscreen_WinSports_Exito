import { useEffect, useRef } from "react";
import { useSession } from "../context/Session/SessionContext";
import {
  identifyAnalyticsUser,
  setAnalyticsProfile,
  trackEvent,
} from "../lib/firebaseAnalytics";

function getDeviceInfo() {
  const ua = navigator.userAgent || "";
  const uaData = navigator.userAgentData;

  const brand = uaData?.brands?.find(
    (b) => !["Chromium", "Not;A=Brand", "Not/A)Brand", "Not_A Brand"].includes(b.brand)
  );
  const browser =
    brand?.brand ||
    (/Edg\//.test(ua) ? "Edge" :
      /Chrome\//.test(ua) ? "Chrome" :
      /Firefox\//.test(ua) ? "Firefox" :
      /Version\/.*Safari/.test(ua) ? "Safari" : "Unknown");
  const browserVersion =
    brand?.version ||
    ua.match(/(?:Edg|Chrome|Firefox|Version)\/(\d+(\.\d+)?)/)?.[1] || "unknown";

  return {
    browser,
    browserVersion,
    os: uaData?.platform || navigator.platform || "unknown",
    deviceType: /Mobi/i.test(ua) ? "smartphone" : "desktop",
    idioma: navigator.language || "unknown",
    resolucion_pantalla: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    referrer: document.referrer || "direct",
    tipo_conexion: navigator.connection?.effectiveType || "unknown",
  };
}

export function AnalyticsTracker() {
  const { sessionId } = useSession();
  const visibleSinceRef = useRef(
    document.visibilityState === "visible" ? Date.now() : null
  );
  const visibleAccumulatedMsRef = useRef(0);

  useEffect(() => {
    if (!sessionId) return;

    const info = getDeviceInfo();
    const connectedAt = new Date().toISOString();

    identifyAnalyticsUser(sessionId);

    setAnalyticsProfile({
      device_type: info.deviceType,
      browser: info.browser,
      browser_version: info.browserVersion,
      os: info.os,
      idioma: info.idioma,
      zona_horaria: info.zona_horaria,
      resolucion_pantalla: info.resolucion_pantalla,
      tipo_conexion: info.tipo_conexion,
    });

    trackEvent("session_open", {
      session_id: sessionId,
      timestamp_conexion: connectedAt,
      tipo_dispositivo: info.deviceType,
      sistema_operativo: info.os,
      navegador: info.browser,
      version_navegador: info.browserVersion,
      idioma: info.idioma,
      resolucion_pantalla: info.resolucion_pantalla,
      viewport: info.viewport,
      zona_horaria: info.zona_horaria,
      referrer: info.referrer,
      tipo_conexion: info.tipo_conexion,
    });

    const getDwellSeconds = () => {
      let totalMs = visibleAccumulatedMsRef.current;
      if (visibleSinceRef.current) totalMs += Date.now() - visibleSinceRef.current;
      return Math.max(1, Math.round(totalMs / 1000));
    };

    const onExit = () => {
      const disconnectedAt = new Date().toISOString();
      if (visibleSinceRef.current) {
        visibleAccumulatedMsRef.current += Date.now() - visibleSinceRef.current;
        visibleSinceRef.current = null;
      }
      trackEvent("session_close", {
        session_id: sessionId,
        timestamp_desconexion: disconnectedAt,
        tiempo_permanencia_seg: getDwellSeconds(),
        tipo_dispositivo: info.deviceType,
        sistema_operativo: info.os,
        navegador: info.browser,
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden" && visibleSinceRef.current) {
        visibleAccumulatedMsRef.current += Date.now() - visibleSinceRef.current;
        visibleSinceRef.current = null;
      }
      if (document.visibilityState === "visible" && !visibleSinceRef.current) {
        visibleSinceRef.current = Date.now();
      }
    };

    window.addEventListener("pagehide", onExit);
    window.addEventListener("beforeunload", onExit);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", onExit);
      window.removeEventListener("beforeunload", onExit);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [sessionId]);

  return null;
}

export default AnalyticsTracker;
