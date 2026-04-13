import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getDatabase, ref, onValue } from "firebase/database";
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
  apiKey: "AIzaSyB7rkLT_XZjhhMAfdTSVuXzeYyAJJ9umvk",
  authDomain: "tagscreenwin.firebaseapp.com",
  databaseURL: "https://tagscreenwin-default-rtdb.firebaseio.com",
  projectId: "tagscreenwin",
  storageBucket: "tagscreenwin.firebasestorage.app",
  messagingSenderId: "428382701077",
  appId: "1:428382701077:web:a67f0e0ad89339bf91701c",
  measurementId: "G-K0WFV4949D",
};

const STORAGE_KEY = "match_commentary_1470618";
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
  const [commentaries, setCommentaries] = useState(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return [];
    }
  });

  // Comentarios provenientes de useFirebaseEvents via localStorage
  const [liveCommentaries, setLiveCommentaries] = useState(() =>
    readCommentariesFromStorage()
  );

  const bottomRef = useRef(null);

  // Persiste en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commentaries));
  }, [commentaries]);

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

  // Scroll suave al bottom cada vez que llega un comentario nuevo
  useEffect(() => {
    if (liveCommentaries.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [liveCommentaries]);

  useEffect(() => {
    if (commentaries.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [commentaries]);

  useEffect(() => {
    console.log("ModalMinuteToMinute realtime");

    const fixture_id = "4832hb22zm42exhgp1fh2n384";

    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    const db = getDatabase(app);
    const feedRef = ref(db, `apiopta/live_feed/${fixture_id}`);

    console.log("feedRef", feedRef);
    const unsubscribe = onValue(feedRef, (snapshot) => {
      const data = snapshot.val();

      console.log("Toda la respuesta:", data);

      if (data) {
        console.log("Texto en vivo:", data?.minute_by_minute?.current?.summary);
        console.log("Evento relevante:", data?.important_event?.current);
        console.log("Video URL:", data?.important_event?.current?.clip?.url_path);
        console.log("Contexto general del partido:", data?.match);

        const summary = data?.minute_by_minute?.current?.comment;
        const minuteText = data?.minute_by_minute?.current?.minute || "";

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

  // Combinar ambas fuentes: los del feed directo y los de useFirebaseEvents
  const allCommentaries = [
    ...commentaries.map((c) => ({ commentary: c.commentary, minute: c.minute })),
    ...liveCommentaries.map((c) => ({ commentary: c.comment, minute: c.minute })),
  ];

  return (
    <motion.div
      className={styles.modalMinuteToMinute}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {allCommentaries.map((item, index) => (
        <Message
          key={index}
          minute={item.minute}
          text={item.commentary}
          //teamHome={teamHome}
          //teamAway={teamAway}
        />
      ))}
      {/* Hook scroll automático */}
      <div ref={bottomRef} />
    </motion.div>
  );
}