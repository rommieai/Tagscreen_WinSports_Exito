import { useRef, useEffect, useState, useMemo } from "react";
import { TargetProvider } from "../../context/TargetContext";
import css from "./juego.module.css";
import GameUI from "../../components/organims/GameUI/Index";
import GameModal from "../../components/organims/CardModal/Index";
import DetectorTv from "../../components/molecules/DetectorTv/Index";
import { useResultado } from "../../context/ResultadoContext";
import TargetIco from "../../components/atoms/TargetIco";
import CameraView from "../../components/CameraView";
import useFirebaseEvents from "../../hooks/useFirebaseEvents";
import useMatchClock from "../../hooks/useMatchClock";
import InputChat from "../../components/atoms/InputChat/Index";
import { useNotifications } from "../../context/Notifications/NotificationsContext";
import {
  useCardModal,
  MODAL_TYPES,
} from "../../context/CardModal/CardModalContext";
import DetectorAudio from "../../components/molecules/DetectorAudio/DetectorAudio";


const isTestMode = import.meta.env.VITE_TEST_MODE === 'true';

const Juego = () => {
  const gamePageRef = useRef(null);
  const [isTvDetected, setIsTvDetected] = useState(false);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [errorResponse, setErrorResponse] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [audioOffset, setAudioOffset] = useState(0);
  const { agregarResultado } = useResultado();
  const { openModal, closeModal, isOpen, modalType } = useCardModal();
  const isStream = import.meta.env.VITE_BACK_ACTIVE_STREAM === "true";
  const [boxRecognized, setIsBoxRecognized] = useState(false);
  const [audioDetected, setAudioDetected] = useState(null);
  const { triggerNotification } = useNotifications();
  const trackedLogosRef = useRef(new Set());
  const hasSyncedRef = useRef(false);
  const [syncInfo, setSyncInfo] = useState(null); // { matchTime, matchTimeSeconds, offsetSec }
  const [jerseyToast, setJerseyToast] = useState(null); // { team, confidence }
  const jerseyToastTimerRef = useRef(null);

  const firebaseConfig = useMemo(() => ({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB7rkLT_XZjhhMAfdTSVuXzeYyAJJ9umvk",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tagscreenwin.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://tagscreenwin-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tagscreenwin",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tagscreenwin.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "428382701077",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:428382701077:web:a67f0e0ad89339bf91701c",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K0WFV4949D",
  }), []);

  const agentFixtureId = import.meta.env.VITE_FIREBASE_FIXTURE_ID || "5ff653se2gnpi4y9a4nus4xec";
  const agentFeedRoot = import.meta.env.VITE_FIREBASE_AGENT_FEED_ROOT || "apiopta/live_feed_agent";
  const agentFeedPath = `${agentFeedRoot}/${agentFixtureId}`;

  const { events, isConnected, error, stats, getServiceStats, downloadEventsJson } =
    useFirebaseEvents(firebaseConfig, {
      maxEvents: 1,
      autoConnect: isStream && audioOffset !== null,
      audioOffset: syncInfo?.offsetSec || 0,
      feedPath: agentFeedPath,
    });

  const matchClock = useMatchClock({ syncInfo });

  // Cloud Vision sync: retry every 1s until the OCR reads a real match_time.
  // Until then the UI keeps rendering whatever the RTDB already has (stale or not).
  useEffect(() => {
    let cancelled = false;
    let timer = null;
    let attempt = 0;

    /*const tick = async () => {
      if (cancelled || hasSyncedRef.current) return;
      attempt++;

      const video = videoRef.current;
      if (!video || !video.videoWidth) {
        timer = setTimeout(tick, 1000);
        return;
      }

      try {
        // Downscale to 640px wide to keep the upload small & Vision fast
        const scale = Math.min(1, 640 / video.videoWidth);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.7));
        if (!blob) throw new Error("no blob");

        const fd = new FormData();
        fd.append("image", blob, "sync.jpg");

        // Per-attempt 8s timeout so a hung request can't block retries
        const ac = new AbortController();
        const killer = setTimeout(() => ac.abort(), 8000);
        const base = import.meta.env.VITE_API_MAIN_URL || "/api/";
        let res;
        try {
          res = await fetch(`${base}sync/match-time`, { method: "POST", body: fd, signal: ac.signal });
        } finally {
          clearTimeout(killer);
        }
        if (cancelled) return;
        if (!res.ok) throw new Error(`sync ${res.status}`);
        const data = await res.json();

        if (data.match_time && data.match_time_seconds != null) {
          const clientNow = Date.now();
          const offsetSec = Math.max(0, Math.round((clientNow - (data.server_ts || clientNow)) / 1000));
          hasSyncedRef.current = true;
          if (!cancelled) {
            setSyncInfo({
              matchTime: data.match_time,
              matchTimeSeconds: data.match_time_seconds,
              offsetSec,
              attempts: attempt,
            });
          }
          console.log("[sync] OK after", attempt, "attempts", data);
          return; 
        }
        console.log("[sync] attempt", attempt, "no match_time yet:", data.raw_text);
      } catch (err) {
        console.warn("[sync] attempt", attempt, "failed:", err?.message || err);
      }

      if (!cancelled) timer = setTimeout(tick, 1000);
    };

    tick();*/

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Track which jersey teams we've already shown a modal for (avoid spam)
  const trackedJerseysRef = useRef(new Set());

  useEffect(() => {
    if (events.length === 0) return;

    const ultimoEvento = events[events.length - 1];
    const metadata = ultimoEvento?.md;

    // --- Box / Logo detections (from YOLO objects) ---
    if (metadata?.objects?.length > 0) {
      const boxDetection = metadata.objects.find(
        (obj) => obj.type === "caja" && obj.confidence >= 0.5,
      );
      const logo = metadata.objects.find(
        (obj) => obj.type === "logo" && obj.confidence >= 0.6,
      );

      if (boxDetection) {
        triggerNotification("recogBox");
        const dataModal = { type: "box", num_caja: boxDetection.num_caja };
        openModal(MODAL_TYPES.PRODUCT, dataModal);
      }

      if (logo) {
        triggerNotification("recogLogo");
        const dataModal = { type: "logo", num_logo: logo.num_logo };
        openModal(MODAL_TYPES.PRODUCT, dataModal);

        if (!trackedLogosRef.current.has(logo.num_logo)) {
          trackedLogosRef.current.add(logo.num_logo);
        }
      }
    }

    // --- Jersey detections (from jersey models) ---
    if (metadata?.jerseys?.length > 0) {
      const bestJersey = metadata.jerseys.reduce((best, j) =>
        j.confidence > (best?.confidence || 0) ? j : best, null
      );

      if (bestJersey && bestJersey.confidence >= 0.5 && !trackedJerseysRef.current.has(bestJersey.team)) {
        if (modalType != 'trivia') {
          console.log('trivia')
          trackedJerseysRef.current.add(bestJersey.team);
          if (isTestMode) {
            // Test mode: small non-blocking corner toast so the camera stays visible
            setJerseyToast({ team: bestJersey.team, confidence: bestJersey.confidence });
            if (jerseyToastTimerRef.current) clearTimeout(jerseyToastTimerRef.current);
            jerseyToastTimerRef.current = setTimeout(() => setJerseyToast(null), 4000);

          } else {
            triggerNotification(`jersey${bestJersey.team}`);
            openModal(MODAL_TYPES.TRIVIA, bestJersey.team );
          }
  
          // Allow re-triggering after 30s so user can see it again
          setTimeout(() => {
            trackedJerseysRef.current.delete(bestJersey.team);
          }, 30000);
        }
      }
    }
  }, [events, agregarResultado, isOpen, modalType]);

  useEffect(() => {
    let stream = null;

    triggerNotification("initNotification");

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            aspectRatio: { ideal: 16 / 9 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch((e) => console.warn("play error", e));
          };
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        setErrorResponse("No se pudo acceder a la cámara");
        setLoading(false);
      }
    };

    if (!isTestMode) {
      startCamera();
    }

    console.log("isTestMode", isTestMode)

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <TargetProvider>
      <div className={css.game_page} ref={gamePageRef}>
        { isTestMode && (
          <>
            {/* Match time display — prominent pill, top-right */}
            {events.length > 0 && events[0]?.md?.match_time && (
              <div className="match-time" style={{
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

            {/* Small jersey-detected toast (bottom-center, non-blocking) */}
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

            {/* Debug banner: RTDB status + detections */}
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
              <span>{isConnected ? "RTDB OK" : "RTDB OFF"} | Ev: {stats.totalReceived}</span>
              <span style={{ color: syncInfo ? "#7fffa1" : "#ffb37f" }}>
                {syncInfo
                  ? `SYNC ${syncInfo.matchTime || "?"} (+${syncInfo.offsetSec}s)`
                  : "SYNC pending…"}
              </span>
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
          </>
        ) }
        <TargetIco tvDetected={isTvDetected} audioState={audioDetected} />
        <div className={css.containerVideo}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={css.video_game}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {confidence >= 48 && (
            <div className={css.confidence}>Detectado: {confidence}%</div>
          )}
        </div>

        {(!isTvDetected || isTestMode) && (
          <>
            {errorResponse && !isTestMode && <div className={css.error}>{errorResponse}</div>}

            {!isTestMode && (
              <DetectorTv
                videoRef={videoRef}
                onDetect={(detected, percentage, category) => {
                  setIsTvDetected(detected);
                  setConfidence(percentage);
                }}
                setLoading={setLoading}
                setErrorResponse={setErrorResponse}
              />
            )}
          </>
        )}
        {/* Match time display — prominent pill, top-right */}
        {matchClock && (
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
            <span>{matchClock}</span>
          </div>
        )}

        {(isTvDetected || isTestMode) && (
          <div className={css.container}>
            <GameUI />
            <GameModal />
            <InputChat />
          </div>
        )}
      </div>
    </TargetProvider>
  );
};

export default Juego;