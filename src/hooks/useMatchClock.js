import { useEffect, useRef, useState } from "react";

const formatSeconds = (totalSec) => {
  const s = Math.max(0, Math.floor(totalSec));
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function useMatchClock({ syncInfo }) {
  const anchorRef = useRef(null);
  const [display, setDisplay] = useState(null);

  useEffect(() => {
    if (syncInfo?.matchTimeSeconds != null && anchorRef.current == null) {
      anchorRef.current = { baseSec: syncInfo.matchTimeSeconds, atMs: Date.now() };
    }
  }, [syncInfo]);

  useEffect(() => {
    const tick = () => {
      const a = anchorRef.current;
      if (!a) return;
      setDisplay(formatSeconds(a.baseSec + (Date.now() - a.atMs) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return display;
}
