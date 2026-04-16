import { useEffect, useState } from "react";
import { getDatabase, ref, onChildAdded, query, orderByChild } from "firebase/database";
import { initializeApp, getApp, getApps } from "firebase/app";
import styles from "./styles.module.css";
import Message from "./Message";

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
const STORAGE_KEY = "match_commentary_1470618_v2";

export default function ModalMinuteToMinute() {
  const [commentaries, setCommentaries] = useState(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commentaries));
  }, [commentaries]);

  useEffect(() => {
    const fixture_id = import.meta.env.VITE_FIREBASE_FIXTURE_ID || "5ff653se2gnpi4y9a4nus4xec";

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getDatabase(app);
    const historyRef = query(
      ref(db, `apiopta/live_feed/${fixture_id}/minute_by_minute/history`),
      orderByChild("generated_at_utc"),
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
    <div className={styles.modalMinuteToMinute}>
      {commentaries.map((item, index) => (
        <Message key={item.key || index} minute={item.minute} text={item.commentary} />
      ))}
    </div>
  );
}
