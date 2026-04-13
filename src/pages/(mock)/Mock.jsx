import { useRef, useEffect, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_MAIN_URL || "/api/";

const Mock = () => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState(null);
  const syncIntervalRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}mock-replay/status`);
      setStatus(await res.json());
    } catch {}
  };

  const startReplay = useCallback(async (offset = 0) => {
    try {
      const res = await fetch(`${API_BASE}mock-replay/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offsetSeconds: offset }),
      });
      setStatus(await res.json());
    } catch (err) {
      console.warn("[mock] start failed:", err);
    }
  }, []);

  const stopReplay = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}mock-replay/stop`, { method: "POST" });
      setStatus(await res.json());
    } catch (err) {
      console.warn("[mock] stop failed:", err);
    }
  }, []);

  // Sync video currentTime to backend every second
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused) return;
      fetch(`${API_BASE}mock-replay/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds: Math.floor(video.currentTime) }),
      }).catch(() => {});
    }, 1000);

    fetchStatus();

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      fetch(`${API_BASE}mock-replay/stop`, { method: "POST" }).catch(() => {});
    };
  }, []);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    startReplay(Math.floor(video?.currentTime || 0));
  }, [startReplay]);

  const handlePause = useCallback(() => {
    stopReplay();
  }, [stopReplay]);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    fetch(`${API_BASE}mock-replay/seek`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seconds: Math.floor(video.currentTime) }),
    }).catch(() => {});
  }, []);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#000",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 9999,
    }}>
      <video
        ref={videoRef}
        playsInline
        controls
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          objectFit: "contain",
          background: "#000",
        }}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
      >
        <source src={`${API_BASE}mock-replay/video`} type="video/webm" />
      </video>

      {/* Status bar */}
      <div style={{
        padding: "8px 16px",
        background: "#111",
        color: "#aaa",
        fontSize: 12,
        fontFamily: "monospace",
        display: "flex",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span>
          {status?.state === "playing" ? "▶ PLAYING" : "⏸ STOPPED"}
          {" · "}
          MT: {status?.currentMatchTime ?? "--:--"}
        </span>
        <span>
          Frame {status?.frameIndex ?? 0} / {status?.totalFrames ?? 0}
        </span>
      </div>
    </div>
  );
};

export default Mock;
