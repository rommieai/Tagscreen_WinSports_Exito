import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback
} from 'react';

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onChildAdded,
  query,
  orderByChild
} from 'firebase/database';

import { useSession } from '../Session/SessionContext';
import { useResultado } from '../ResultadoContext';

const StreamEventsContext = createContext();

/* ---------------- FIREBASE CONFIG ---------------- */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let firebaseApp = null;
let database = null;

const initFirebase = () => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    database = getDatabase(firebaseApp);
    console.log('[RTDB] Firebase inicializado');
  }
  return database;
};

/* ---------------- PROVIDER ---------------- */

export function StreamEventsProvider({ children }) {
  const { sessionId } = useSession();
  const { agregarResultado } = useResultado();

  const currentMinuteRef = useRef(null);
  const listenersRef = useRef(new Map()); // minutoKey → unsubscribe function
  const lastEventTimestampRef = useRef(null);

  const isStream = import.meta.env.VITE_BACK_ACTIVE_STREAM === 'true';

  /* ---------------- HELPERS ---------------- */

  const getCurrentMinuteKey = useCallback(() => {
    const now = new Date();
    return (
      now.getUTCFullYear().toString() +
      String(now.getUTCMonth() + 1).padStart(2, '0') +
      String(now.getUTCDate()).padStart(2, '0') +
      '_' +
      String(now.getUTCHours()).padStart(2, '0') +
      String(now.getUTCMinutes()).padStart(2, '0') +
      '00'
    );
  }, []);

  /* ---------------- LISTENER MANAGEMENT ---------------- */

  const startListeningToMinute = useCallback(
    (minuteKey, db) => {
      if (listenersRef.current.has(minuteKey)) {
        console.log(`[RTDB] Ya escuchando minuto: ${minuteKey}`);
        return;
      }

      console.log(`[RTDB] Iniciando escucha para minuto: ${minuteKey}`);

      const eventsRef = ref(db, `program_events/${minuteKey}/events`);
      const q = query(eventsRef, orderByChild('timestamp'));

      const unsubscribe = onChildAdded(q, snapshot => {
        const evento = snapshot.val();
        console.log('[DEBUG RAW EVENTO]', {
          key: snapshot.key,
          minuto: minuteKey,
          valor: evento
        });

        if (!evento?.timestamp) {
          console.log('[DEBUG] Evento sin timestamp', evento);
          return;
        }

        // Comenta estas líneas por ahora
        if (lastEventTimestampRef.current && evento.timestamp <= lastEventTimestampRef.current) return;
        lastEventTimestampRef.current = evento.timestamp;

        agregarResultado(evento?.valor?.metadata);
        console.log('[DEBUG] Evento debería haber sido procesado');
      });

      listenersRef.current.set(minuteKey, unsubscribe);

      // Programamos limpieza retardada (ej: 3 minutos después de dejar de ser actual)
      setTimeout(() => {
        if (minuteKey !== currentMinuteRef.current) {
          console.log(`[RTDB] Limpiando listener antiguo: ${minuteKey}`);
          const unsub = listenersRef.current.get(minuteKey);
          if (unsub) {
            unsub();
            listenersRef.current.delete(minuteKey);
          }
        }
      }, 3 * 60 * 1000); // 3 minutos de gracia
    },
    [agregarResultado]
  );

  /* ---------------- MAIN LOGIC ---------------- */

  useEffect(() => {
    if (!isStream) {
      console.log('[RTDB] Stream desactivado (VITE_BACK_ACTIVE_STREAM no es true)');
      return;
    }

    if (!sessionId) {
      console.warn('[RTDB] Esperando sessionId...');
      return;
    }

    const db = initFirebase();
    console.log(`[RTDB] Iniciando stream para sesión ${sessionId}`);

    // Iniciar con el minuto actual
    const initialMinute = getCurrentMinuteKey();
    currentMinuteRef.current = initialMinute;
    startListeningToMinute(initialMinute, db);

    // Chequear cada 10 segundos si cambió el minuto
    const checkInterval = setInterval(() => {
      const newMinute = getCurrentMinuteKey();

      if (newMinute !== currentMinuteRef.current) {
        console.log(
          `[RTDB] Cambio de minuto detectado: ${currentMinuteRef.current} → ${newMinute}`
        );
        currentMinuteRef.current = newMinute;
        startListeningToMinute(newMinute, db);
      }
    }, 10_000);

    return () => {
      console.log('[RTDB] Limpiando todos los listeners al desmontar provider');

      listenersRef.current.forEach((unsub, key) => {
        console.log(`[RTDB] Desuscribiendo: ${key}`);
        unsub();
      });
      listenersRef.current.clear();

      clearInterval(checkInterval);
      lastEventTimestampRef.current = null;
    };
  }, [isStream, sessionId, getCurrentMinuteKey, startListeningToMinute]);

  return (
    <StreamEventsContext.Provider value={{}}>
      {children}
    </StreamEventsContext.Provider>
  );
}

export const useStreamEvents = () => useContext(StreamEventsContext);
