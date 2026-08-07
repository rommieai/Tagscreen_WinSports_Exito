import { useRef, useEffect, useState } from "react";
import { TargetProvider } from "../../context/TargetContext";
import { VodProvider } from "../../context/VodContext";
import css from "./azteca.module.css";
import GameUI from "../../components/organims/GameUI/Index";
import GameModal from "../../components/organims/CardModal/Index";
import { useNotifications } from "../../context/Notifications/NotificationsContext";
import { useCardModal, MODAL_TYPES } from "../../context/CardModal/CardModalContext";
import aztecaEvents from "./azteca_events.json";
import { setAnalyticsEnv } from "../../lib/firebaseAnalytics";

const VIDEO_ID = "azteca";
const VOD_FIXTURE_ID = "vod_azteca";
const POLL_MS = 1000;

const toMinuteKey = (totalSec) => {
  const s = Math.floor(totalSec);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const AztecaInner = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const trackedKeysRef = useRef(new Set());
  const { triggerNotification } = useNotifications();
  const { openModal, modalType } = useCardModal();

  // Tag all analytics events from this page as env=azteca
  useEffect(() => {
    setAnalyticsEnv('azteca');
    return () => setAnalyticsEnv(null);
  }, []);

  // Open camera — same as /juego
  useEffect(() => {
    let stream = null;

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
            videoRef.current.play().catch(() => {});
            setCameraReady(true);
          };
        }
      } catch (err) {
        console.warn("[azteca] camera error:", err);
        setCameraReady(true); // continue without camera
      }
    };

    startCamera();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  // Poll VOD backend for current video time
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/vod/status/${VIDEO_ID}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.played) {
          setIsPlaying(true);
          setVideoTime(data.video_time);
        }
      } catch {
        // silently ignore network errors
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, []);

  // Match events to current video time
  useEffect(() => {
    if (!isPlaying) return;

    const minuteKey = toMinuteKey(videoTime);
    if (trackedKeysRef.current.has(minuteKey)) return;

    const entry = aztecaEvents.eventos.find(
      (e) => e.minutekey === minuteKey && e.event
    );
    if (!entry) return;

    trackedKeysRef.current.add(minuteKey);

    if (entry.event === "arbitro" || entry.event === "referee") {
      triggerNotification("referee");
      setTimeout(() => openModal(MODAL_TYPES.REFEREE), 1500);
    } else if (entry.event === "bench") {
      triggerNotification("bench");
    } else if (entry.event === "player") {
      const key = (entry.playerName ?? "player")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]/g, "");
      triggerNotification(key);
      setTimeout(() => openModal(MODAL_TYPES.PLAYER_INFO, { name: entry.playerName }), 1500);
    } else if (entry.event === "goal") {
      triggerNotification("goal");
      setTimeout(() => openModal(MODAL_TYPES.GOAL), 1500);
    } else if (entry.event === "jersey") {
      triggerNotification(`jersey${entry.teamJersey}`);
      setTimeout(() => {
        if (modalType !== "trivia") {
          openModal(MODAL_TYPES.TRIVIA, entry.teamJersey);
        }
      }, 1500);
    }
  }, [videoTime, isPlaying, triggerNotification, openModal, modalType]);

  return (
    <div className={css.game_page}>
      {/* Camera feed as background — same pattern as /juego */}
      <video
        ref={videoRef}
        className={css.video_game}
        autoPlay
        playsInline
        muted
      />

      {/* Waiting overlay — shown until webplayer starts */}
      {!isPlaying && cameraReady && (
        <div className={css.waiting}>
          <div className={css.waiting_inner}>
            <span className={css.waiting_dot} />
            <p className={css.waiting_text}>
              Esperando que comience el video...
            </p>
            <p className={css.waiting_hint}>
              Abre <strong>mocksoccer.tagscreen.ai/vod</strong> en la TV
            </p>
          </div>
        </div>
      )}

      {/* Video time badge (top-right, while playing) */}
      {isPlaying && (
        <div className={css.time_badge}>
          <span className={css.time_dot} />
          {toMinuteKey(videoTime)}
        </div>
      )}

      <GameUI />
      <GameModal />
    </div>
  );
};

const Azteca = () => (
  <VodProvider fixtureId={VOD_FIXTURE_ID}>
    <TargetProvider>
      <AztecaInner />
    </TargetProvider>
  </VodProvider>
);

export default Azteca;
