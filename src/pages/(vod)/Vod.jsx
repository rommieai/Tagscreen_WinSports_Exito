import { useRef, useState, useCallback } from "react";
import css from "./vod.module.css";

const VIDEO_ID = "azteca";

const fmtTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const Vod = () => {
  const videoRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [videoSeconds, setVideoSeconds] = useState(0);
  const lastSyncRef = useRef(0);

  const handlePlay = useCallback(async () => {
    if (hasStarted) return;
    setHasStarted(true);
    try {
      await fetch("/api/vod/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: VIDEO_ID,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn("[vod] play ping failed:", err);
    }
  }, [hasStarted]);

  const handleTimeUpdate = useCallback((e) => {
    const t = e.target.currentTime;
    setVideoSeconds(t);

    if (t - lastSyncRef.current >= 2) {
      lastSyncRef.current = t;
      fetch("/api/vod/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: VIDEO_ID, video_time: t }),
      }).catch(() => {});
    }
  }, []);

  const handlePause = useCallback(() => {
    const t = videoRef.current?.currentTime ?? 0;
    fetch("/api/vod/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_id: VIDEO_ID, video_time: t }),
    }).catch(() => {});
  }, []);

  return (
    <div className={css.page}>
      <div className={css.player_wrapper}>
        <div className={css.header}>
          <span className={css.logo}>▶ Webplayer</span>
          {hasStarted && (
            <span className={css.live_badge}>EN VIVO</span>
          )}
        </div>

        <video
          ref={videoRef}
          className={css.video}
          controls
          playsInline
          onPlay={handlePlay}
          onTimeUpdate={handleTimeUpdate}
          onPause={handlePause}
          onSeeked={handlePause}
        >
          <source src="/api/vod/video" type="video/mp4" />
          Tu navegador no soporta reproducción de video.
        </video>

        <div className={css.time_bar}>
          <div className={css.time_item}>
            <span className={css.time_label}>Tiempo</span>
            <span className={css.time_value}>{fmtTime(videoSeconds)}</span>
          </div>
          <div className={css.time_item}>
            <span className={css.time_label}>Estado</span>
            <span className={css.time_value} style={{ color: hasStarted ? "#4ade80" : "#6b7280" }}>
              {hasStarted ? "Reproduciendo" : "En espera"}
            </span>
          </div>
          <div className={css.qr_hint}>
            Abre <strong>mocksoccer.tagscreen.ai/azteca</strong> en tu celular
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vod;
