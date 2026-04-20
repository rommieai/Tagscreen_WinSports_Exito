import { useEffect, useMemo, useRef, useState } from "react";
import {
  getDatabase,
  ref,
  onChildAdded,
  off,
  get,
  query,
  orderByChild,
  startAt,
} from "firebase/database";
import { initializeApp, getApp, getApps } from "firebase/app";
import styles from "./styles.module.css";
import { useSam3Sync } from "../../../../context/Sam3Sync/Sam3SyncContext";

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

const MAX_ENTRIES = 200;
const BACKLOG_MS = 5000;

function formatMatchTime(seconds) {
  if (typeof seconds !== "number") return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatLocalTime(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function buildEntry(key, data) {
  const md = data.md || {};
  const jerseys = Array.isArray(md.jerseys) ? md.jerseys : [];
  const objects = Array.isArray(md.objects) ? md.objects : [];
  return {
    key,
    matchTime: md.match_time || formatMatchTime(md.match_time_seconds),
    matchTimeSeconds: md.match_time_seconds ?? null,
    matchTimeEstimated: md.match_time_estimated ?? false,
    jerseys,
    objects,
    timestamp: data.timestamp || Date.now(),
  };
}

export default function ModalMinuteToMinuteSam3() {
  const syncInfo = useSam3Sync();
  const [entries, setEntries] = useState([]);
  const syncReady = Boolean(
    syncInfo &&
      typeof syncInfo.matchTimeSeconds === "number" &&
      typeof syncInfo.syncedAtMs === "number",
  );

  const syncInfoRef = useRef(null);
  useEffect(() => {
    syncInfoRef.current = syncInfo;
  }, [syncInfo]);

  useEffect(() => {
    if (!syncReady) return;

    const fixtureId = import.meta.env.VITE_FIREBASE_FIXTURE_ID || "5ff653se2gnpi4y9a4nus4xec";
    const feedRoot = import.meta.env.VITE_FIREBASE_SAM3_FEED_ROOT || "apiopta/live_feed_sam3";
    const feedPath = `${feedRoot}/${fixtureId}`;

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getDatabase(app);
    const feedRef = ref(db, feedPath);

    const seen = new Set();
    const pending = new Set();
    let cancelled = false;

    const pushEntry = (entry) => {
      setEntries((prev) => {
        const next = [entry, ...prev];
        return next.slice(0, MAX_ENTRIES);
      });
    };

    const scheduleEntry = (key, data) => {
      const sync = syncInfoRef.current;
      const mts = data?.md?.match_time_seconds;
      const entry = buildEntry(key, data);

      if (entry.jerseys.length === 0 && entry.objects.length === 0) {
        return;
      }

      if (!sync || typeof mts !== "number") {
        pushEntry(entry);
        return;
      }

      const displayAtMs = sync.syncedAtMs + (mts - sync.matchTimeSeconds) * 1000;
      const delay = displayAtMs - Date.now();

      if (delay > 0) {
        const t = setTimeout(() => {
          pending.delete(t);
          if (!cancelled) pushEntry(entry);
        }, delay);
        pending.add(t);
      } else if (delay > -BACKLOG_MS) {
        pushEntry(entry);
      }
      // else: demasiado viejo para el reloj del usuario, se descarta
    };

    const init = async () => {
      try {
        const syncMts = syncInfoRef.current.matchTimeSeconds;
        const q = query(
          feedRef,
          orderByChild("md/match_time_seconds"),
          startAt(syncMts - BACKLOG_MS / 1000),
        );
        const snapshot = await get(q);
        if (!cancelled && snapshot.exists()) {
          const val = snapshot.val();
          Object.entries(val).forEach(([key, data]) => {
            if (!data) return;
            seen.add(key);
            scheduleEntry(key, data);
          });
        }
      } catch (err) {
        console.warn("[sam3 debug] backfill error:", err);
      }
    };

    init();

    const liveCallback = (snapshot) => {
      const key = snapshot.key;
      if (seen.has(key)) return;
      seen.add(key);
      const data = snapshot.val();
      if (!data) return;
      scheduleEntry(key, data);
    };

    onChildAdded(feedRef, liveCallback);

    return () => {
      cancelled = true;
      off(feedRef, "child_added", liveCallback);
      pending.forEach((t) => clearTimeout(t));
      pending.clear();
    };
  }, [syncReady]);

  const stats = useMemo(() => {
    let withJerseys = 0;
    let totalJerseys = 0;
    for (const e of entries) {
      const j = e.jerseys.length;
      totalJerseys += j;
      if (j > 0) withJerseys++;
    }
    return { withJerseys, totalJerseys };
  }, [entries]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>SAM3 debug feed</div>
        <div className={styles.stats}>
          {syncReady
            ? `reconocimientos: ${entries.length} · con jerseys: ${stats.withJerseys} · total jerseys: ${stats.totalJerseys}`
            : "esperando sync del reloj…"}
        </div>
      </div>
      {syncReady && entries.length === 0 && (
        <div className={styles.empty}>Esperando reconocimientos…</div>
      )}
      {!syncReady && (
        <div className={styles.empty}>
          Los eventos se mostrarán alineados al reloj del usuario en cuanto el sync esté disponible.
        </div>
      )}
      {entries.map((e) => {
        const totalJerseys = e.jerseys.length;
        const totalObjects = e.objects.length;
        const nothing = totalJerseys === 0 && totalObjects === 0;
        return (
          <div
            key={e.key}
            className={`${styles.row} ${nothing ? styles.rowEmpty : ""}`}
          >
            <div className={styles.rowHead}>
              <span className={styles.time}>
                {e.matchTime}
                {e.matchTimeEstimated ? "*" : ""}
                {typeof e.matchTimeSeconds === "number" && (
                  <span className={styles.mts}> ({e.matchTimeSeconds}s)</span>
                )}
              </span>
              <span className={styles.localTime}>
                {formatLocalTime(e.timestamp)}
              </span>
            </div>
            {nothing ? (
              <div className={styles.nothing}>sin reconocimientos (filtro ≥5% área o conf &lt;0.5)</div>
            ) : (
              <>
                {totalJerseys > 0 ? (
                  <div className={styles.section}>
                    <span className={styles.sectionLabel}>
                      jerseys ({totalJerseys}):
                    </span>
                    {e.jerseys.map((j, i) => (
                      <div key={i} className={styles.item}>
                        <b>{j.team}</b>
                        {j.prompt_class ? ` · ${j.prompt_class}` : ""} · conf{" "}
                        <b>{Math.round((j.confidence ?? 0) * 100)}%</b> · área{" "}
                        <b>
                          {typeof j.screen_pct === "number"
                            ? j.screen_pct.toFixed(1)
                            : "?"}
                          %
                        </b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.nothing}>sin jerseys</div>
                )}
                {totalObjects > 0 && (
                  <div className={styles.section}>
                    <span className={styles.sectionLabel}>
                      objects ({totalObjects}):
                    </span>
                    {e.objects.map((o, i) => (
                      <div key={i} className={styles.item}>
                        · {o.type}
                        {o.num_caja != null ? ` #${o.num_caja}` : ""}
                        {o.num_logo != null ? ` #${o.num_logo}` : ""}
                        {" — conf "}
                        {Math.round((o.confidence ?? 0) * 100)}%
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
