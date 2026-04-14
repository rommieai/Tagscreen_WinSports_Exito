import { useRef, useEffect, useState } from "react";
import { TargetProvider } from "../../context/TargetContext";
import css from "../(game)/juego.module.css";
import GameUI from "../../components/organims/GameUI/Index";
import GameModal from "../../components/organims/CardModal/Index";
import { useResultado } from "../../context/ResultadoContext";
import TargetIco from "../../components/atoms/TargetIco";
import useFirebaseEvents from "../../hooks/useFirebaseEvents";
import InputChat from "../../components/atoms/InputChat/Index";
import { useNotifications } from "../../context/Notifications/NotificationsContext";
import {
  useCardModal,
  MODAL_TYPES,
} from "../../context/CardModal/CardModalContext";

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

const isTestMode = import.meta.env.VITE_TEST_MODE === "true";

const Demo = () => {
  const gamePageRef = useRef(null);
  const { agregarResultado } = useResultado();
  const { openModal } = useCardModal();
  const isStream = import.meta.env.VITE_BACK_ACTIVE_STREAM === "true";
  const [audioDetected, setAudioDetected] = useState(null);
  const { triggerNotification } = useNotifications();
  const trackedLogosRef = useRef(new Set());
  const trackedJerseysRef = useRef(new Set());
  const [jerseyToast, setJerseyToast] = useState(null);
  const jerseyToastTimerRef = useRef(null);

  const { events, isConnected, stats } =
    useFirebaseEvents(firebaseConfig, {
      maxEvents: 1,
      autoConnect: isStream,
      audioOffset: 0,
    });

  useEffect(() => {
    if (events.length === 0) return;

    const ultimoEvento = events[events.length - 1];
    const metadata = ultimoEvento?.md;

    // --- Box / Logo detections ---
    if (metadata?.objects?.length > 0) {
      const boxDetection = metadata.objects.find(
        (obj) => obj.type === "caja" && obj.confidence >= 0.5,
      );
      const logo = metadata.objects.find(
        (obj) => obj.type === "logo" && obj.confidence >= 0.6,
      );

      if (boxDetection) {
        triggerNotification("recogBox");
        openModal(MODAL_TYPES.PRODUCT, { type: "box", num_caja: boxDetection.num_caja });
      }

      if (logo) {
        triggerNotification("recogLogo");
        openModal(MODAL_TYPES.PRODUCT, { type: "logo", num_logo: logo.num_logo });
        if (!trackedLogosRef.current.has(logo.num_logo)) {
          trackedLogosRef.current.add(logo.num_logo);
        }
      }
    }

    // --- Jersey detections ---
    if (metadata?.jerseys?.length > 0) {
      const bestJersey = metadata.jerseys.reduce((best, j) =>
        j.confidence > (best?.confidence || 0) ? j : best, null
      );

      if (bestJersey && bestJersey.confidence >= 0.5 && !trackedJerseysRef.current.has(bestJersey.team)) {
        trackedJerseysRef.current.add(bestJersey.team);
        if (isTestMode) {
          setJerseyToast({ team: bestJersey.team, confidence: bestJersey.confidence });
          if (jerseyToastTimerRef.current) clearTimeout(jerseyToastTimerRef.current);
          jerseyToastTimerRef.current = setTimeout(() => setJerseyToast(null), 4000);
        } else {
          triggerNotification("recogBox");
          openModal(MODAL_TYPES.PRODUCT, { type: "jersey", team: bestJersey.team });
        }

        setTimeout(() => {
          trackedJerseysRef.current.delete(bestJersey.team);
        }, 30000);
      }
    }
  }, [events, agregarResultado]);

  useEffect(() => {
    triggerNotification("initNotification");

    setTimeout(() => {
      openModal(MODAL_TYPES.MINUTE_TO_MINUTE, "data");
    }, 3000);
  }, []);

  return (
    <TargetProvider>
      <div className={css.game_page} ref={gamePageRef}>
        <TargetIco tvDetected={true} audioState={audioDetected} />

        {/* Fake camera background */}
        <div className={css.containerVideo}>
          <div
            className={css.video_game}
            style={{
              width: "100%",
              height: "100%",
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
              fontSize: 14,
              fontFamily: "monospace",
            }}
          >
            DEMO — waiting for RTDB events
          </div>
        </div>

        {/* Match time pill */}
        {events.length > 0 && events[0]?.md?.match_time && (
          <div style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 9999,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 18,
            fontWeight: "bold",
            fontFamily: "'Inter', monospace",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>MIN</span>
            <span>{events[0].md.match_time}</span>
          </div>
        )}

        {/* Jersey toast */}
        {jerseyToast && (
          <div style={{
            position: "absolute",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "rgba(255, 209, 0, 0.95)",
            color: "#0a0080",
            padding: "8px 16px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            maxWidth: "80%",
            whiteSpace: "nowrap",
          }}>
            <span>👕</span>
            <span>{jerseyToast.team.toUpperCase()} · {Math.round(jerseyToast.confidence * 100)}%</span>
          </div>
        )}

        {/* Debug banner */}
        <div style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 9999,
          background: isConnected ? "rgba(0,180,0,0.85)" : "rgba(200,0,0,0.85)",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: 8,
          fontSize: 10,
          fontFamily: "monospace",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>
          <span>{isConnected ? "RTDB OK" : "RTDB OFF"} | Ev: {stats.totalReceived} | DEMO</span>
          {events.length > 0 && events[0]?.md?.jerseys?.length > 0 && (
            <span style={{ color: "#00ffcc" }}>
              Jersey: {events[0].md.jerseys.map(j => `${j.team}(${Math.round(j.confidence * 100)}%)`).join(", ")}
            </span>
          )}
          {events.length > 0 && events[0]?.md?.objects?.length > 0 && (
            <span style={{ color: "#ffff00" }}>
              {events[0].md.objects.map(o => `${o.type}(${Math.round(o.confidence * 100)}%)`).join(", ")}
            </span>
          )}
        </div>

        <div className={css.container}>
          <GameUI />
          <GameModal />
          <InputChat />
        </div>
      </div>
    </TargetProvider>
  );
};

export default Demo;
