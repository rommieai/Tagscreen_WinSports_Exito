import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getDatabase, ref, onChildAdded, query, orderByChild } from "firebase/database";
import { initializeApp, getApp, getApps } from "firebase/app";
import styles from "./styles.module.css";
import Message from "./Message";

const containerVariants = {
  hidden: {
    opacity: 0,
    y: -32,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
      delay: 0.15,
    },
  },
};

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

const STORAGE_KEY = "current_match_commentary";
const COMENTARIES_KEY = "match_comentaries";

const readCommentariesFromStorage = () => {
  try {
    const saved = localStorage.getItem(COMENTARIES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Error leyendo match_comentaries:", e);
    return [];
  }
};

export default function ModalMinuteToMinute() {
  const [commentaries, setCommentaries] = useState([]);

  // Comentarios provenientes de useFirebaseEvents via localStorage
  const [liveCommentaries, setLiveCommentaries] = useState(() =>
    readCommentariesFromStorage()
  );

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // Previous mounts persisted commentaries to localStorage, which caused future
  // events (e.g. 90+3) from an earlier play to leak to the top of the list on
  // the next mount. Firebase history is the source of truth now — drop the
  // stale cache so we start clean.
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Escuchar nuevos eventos guardados por useFirebaseEvents en tiempo real
  useEffect(() => {
    const handleStorageUpdate = () => {
      setLiveCommentaries(readCommentariesFromStorage());
    };

    // Escuchar evento custom disparado desde el hook
    window.addEventListener("match_comentaries_updated", handleStorageUpdate);

    // También escuchar el evento nativo de storage (para otras pestañas)
    const handleNativeStorage = (e) => {
      if (e.key === COMENTARIES_KEY) handleStorageUpdate();
    };
    window.addEventListener("storage", handleNativeStorage);

    return () => {
      window.removeEventListener("match_comentaries_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleNativeStorage);
    };
  }, []);

  // Auto-scroll al final cuando llega un comentario nuevo. Usar solo
  // scrollIntoView con smooth se interrumpe si llegan eventos en ráfaga, así
  // que forzamos scrollTop del contenedor scrolleable (CardModal .minuteToMinute)
  // y complementamos con scrollIntoView.
  useEffect(() => {
    if (commentaries.length === 0 && liveCommentaries.length === 0) return;
    const el = containerRef.current;
    const scrollable = el?.closest('[class*="minuteToMinute"]') ?? el?.parentElement;
    if (scrollable) {
      scrollable.scrollTop = scrollable.scrollHeight;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [commentaries, liveCommentaries]);

  useEffect(() => {
    const fixture_id = import.meta.env.VITE_FIREBASE_FIXTURE_ID || "5ff653se2gnpi4y9a4nus4xec";

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getDatabase(app);
    const historyRef = query(
      ref(db, `apiopta/live_feed/${fixture_id}/minute_by_minute/history`),
      orderByChild("match_seconds"),
    );

    const seen = new Set();
    const unsubscribe = onChildAdded(historyRef, (snapshot) => {
      const entry = snapshot.val();
      if (!entry) return;

      const key = snapshot.key || entry.generated_at_utc || `${entry.minute}-${entry.summary}`;
      if (seen.has(key)) return;
      seen.add(key);

      const summary = entry.summary;
      const minute = entry.minute ?? "";
      if (!summary) return;

      setCommentaries((prev) => {
        if (prev.some((item) => item.key === key)) return prev;
        return [...prev, { key, commentary: summary, minute: String(minute) }];
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={styles.modalMinuteToMinute}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {commentaries.map((item, index) => (
        <Message key={item.key || index} minute={item.minute} text={item.commentary} />
      ))}
      {/* Hook scroll automático */}
      <div ref={bottomRef} />
    </motion.div>
  );
}
