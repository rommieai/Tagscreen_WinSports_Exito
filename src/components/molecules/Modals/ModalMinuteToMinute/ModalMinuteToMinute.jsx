import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { initializeApp, getApp, getApps } from "firebase/app";
import styles from "./styles.module.css";
import Message from "./Message";

const firebaseConfig = {
  apiKey: "AIzaSyB7rkLT_XZjhhMAfdTSVuXzeYyAJJ9umvk",
  authDomain: "tagscreenwin.firebaseapp.com",
  databaseURL: "https://tagscreenwin-default-rtdb.firebaseio.com",
  projectId: "tagscreenwin",
  storageBucket: "tagscreenwin.firebasestorage.app",
  messagingSenderId: "428382701077",
  appId: "1:428382701077:web:a67f0e0ad89339bf91701c",
  measurementId: "G-K0WFV4949D"
};
const STORAGE_KEY = "match_commentary_1470618";

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
    console.log("ModalMinuteToMinute realtime");
    
    // Yo agregaré el fixture_id luego
    const fixture_id = "5ff653se2gnpi4y9a4nus4xec"; 
    
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    
    const db = getDatabase(app);
    const feedRef = ref(db, `apiopta/live_feed/${fixture_id}`);

    const unsubscribe = onValue(feedRef, (snapshot) => {
      const data = snapshot.val();
      
      console.log("Toda la respuesta:", data);
      
      if (data) {
        console.log("Texto en vivo:", data?.minute_by_minute?.current?.summary);
        console.log("Evento relevante:", data?.important_event?.current);
        console.log("Video URL:", data?.important_event?.current?.clip?.url_path);
        console.log("Contexto general del partido:", data?.match);

        const summary = data?.minute_by_minute?.current?.summary;
        const minuteText = data?.minute_by_minute?.current?.minute || '';

        if (summary) {
          setCommentaries((prev) => {
            const lastItem = prev[prev.length - 1];

            if (lastItem && lastItem.commentary === summary) {
              return prev;
            }

            return [...prev, { commentary: summary, minute: minuteText }];
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.modalMinuteToMinute}>
      {commentaries.map((item, index) => (
        <Message key={index} minute={item.minute} text={item.commentary} />
      ))}
    </div>
  );
}