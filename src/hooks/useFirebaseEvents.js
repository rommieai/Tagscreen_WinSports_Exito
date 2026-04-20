import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp, getApp } from "firebase/app";
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

const BACKLOG_MS = 5000;

export function useFirebaseEvents(config, options = {}) {
  const {
    maxEvents = 100,
    autoConnect = true,
    historyLimit = 200,
    audioOffset = 0,
    feedPath = null,
    syncInfo = null,
  } = options;

  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReceived: 0,
    currentMinute: "",
    lastEventAt: null,
  });

  const dbRef = useRef(null);
  const currentMinuteKeyRef = useRef("");
  const currentMinuteRef = useRef(null);
  const currentListenerRef = useRef(null);
  const scheduleTimeoutRef = useRef(null);
  const processedByMinuteRef = useRef(new Map());
  const eventKeysUIRef = useRef(new Set());
  const isInitializedRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const eventBufferRef = useRef([]);
  const flushTimeoutRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const rawEventsLogRef = useRef([]); // Ref para almacenar todos los eventos que llegan para descargar
  const scheduledTimeoutsRef = useRef(new Set());
  const syncInfoRef = useRef(null);

  const getCurrentMinuteKey = useCallback(
    (date = null) => {
      const now = date || new Date();
      const offsetMs = audioOffset * 1000;
      const adjustedDate = new Date(now.getTime() - offsetMs);

      const year = adjustedDate.getUTCFullYear();
      const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(adjustedDate.getUTCDate()).padStart(2, "0");
      const hour = String(adjustedDate.getUTCHours()).padStart(2, "0");
      const minute = String(adjustedDate.getUTCMinutes()).padStart(2, "0");

      return `${year}${month}${day}_${hour}${minute}00`;
    },
    [audioOffset],
  );

  const downloadEventsJson = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawEventsLogRef.current, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `firebase_events_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, []);

  useEffect(() => {
    window.downloadFirebaseEvents = downloadEventsJson;
    return () => {
      delete window.downloadFirebaseEvents;
    };
  }, [downloadEventsJson]);

  const flushEventBuffer = useCallback(() => {
    if (eventBufferRef.current.length === 0) return;

    const newEvents = [...eventBufferRef.current];
    eventBufferRef.current = [];

    const latestEvent = newEvents[0];

    setEvents((prev) => {
      const combined = [...newEvents, ...prev];
      return combined.slice(0, maxEvents);
    });

    setStats((prev) => ({
      ...prev,
      totalReceived: prev.totalReceived + newEvents.length,
      lastEventAt: new Date(),
      currentMinute: latestEvent?.minuteKey || prev.currentMinute,
    }));

    if (latestEvent?.timestamp) {
      lastTimestampRef.current = latestEvent.timestamp;
    }
  }, [maxEvents]);

  const handleNewEvent = useCallback(
    (event) => {
      if (eventKeysUIRef.current.has(event.eventKey)) {
        return;
      }

      eventKeysUIRef.current.add(event.eventKey);
      eventBufferRef.current.push(event);

      if (!flushTimeoutRef.current) {
        flushTimeoutRef.current = setTimeout(() => {
          flushEventBuffer();
          flushTimeoutRef.current = null;
        }, 100);
      }
    },
    [flushEventBuffer],
  );

  useEffect(() => {
    syncInfoRef.current = syncInfo;
  }, [syncInfo]);

  const emitScheduled = useCallback(
    (event) => {
      const sync = syncInfoRef.current;
      const mts = event?.md?.match_time_seconds;

      if (!sync || typeof mts !== "number" || typeof sync.matchTimeSeconds !== "number" || typeof sync.syncedAtMs !== "number") {
        handleNewEvent(event);
        return;
      }

      const displayAtMs = sync.syncedAtMs + (mts - sync.matchTimeSeconds) * 1000;
      const delay = displayAtMs - Date.now();

      if (delay > 0) {
        const t = setTimeout(() => {
          scheduledTimeoutsRef.current.delete(t);
          handleNewEvent(event);
        }, delay);
        scheduledTimeoutsRef.current.add(t);
      } else if (delay > -BACKLOG_MS) {
        handleNewEvent(event);
      }
      // else: evento demasiado viejo respecto al match_time del usuario, descartar
    },
    [handleNewEvent],
  );

  const scheduleNextMinuteCheck = useCallback(() => {
    if (scheduleTimeoutRef.current) {
      clearTimeout(scheduleTimeoutRef.current);
    }

    const now = new Date();
    const msToNextMinute =
      (60 - now.getUTCSeconds()) * 1000 - now.getUTCMilliseconds() + 100;

    scheduleTimeoutRef.current = setTimeout(() => {
      const newMinuteKey = getCurrentMinuteKey();

      if (newMinuteKey !== currentMinuteKeyRef.current) {
        startListeningToMinute(newMinuteKey, false).catch((err) => {
          console.error("Error en cambio de minuto:", err);
        });
      }

      scheduleNextMinuteCheck();
    }, msToNextMinute);
  }, [getCurrentMinuteKey]);

  const cleanupOldProcessedEvents = useCallback(() => {
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    const threeMinutesAgoKey = getCurrentMinuteKey(threeMinutesAgo);

    processedByMinuteRef.current.forEach((eventSet, keyMinute) => {
      if (keyMinute < threeMinutesAgoKey) {
        processedByMinuteRef.current.delete(keyMinute);
      }
    });

    const uiKeysToDelete = [];
    eventKeysUIRef.current.forEach((key) => {
      const [minutePart] = key.split("-");
      if (minutePart && minutePart < threeMinutesAgoKey) {
        uiKeysToDelete.push(key);
      }
    });

    uiKeysToDelete.forEach((key) => eventKeysUIRef.current.delete(key));
  }, [getCurrentMinuteKey]);

  const startListeningToMinute = useCallback(
    async (minuteKey, skipExisting = true) => {
      if (!dbRef.current) {
        console.error("Database no inicializada");
        return;
      }

      if (isTransitioningRef.current) {
        return;
      }

      isTransitioningRef.current = true;

      //console.log("📍 minuteKey a consultar:", minuteKey);
     // console.log("📍 último minuteKey:", currentMinuteKeyRef.current);

      try {
        if (currentListenerRef.current && currentMinuteRef.current) {
          try {
            off(
              currentMinuteRef.current,
              "child_added",
              currentListenerRef.current,
            );
          } catch (e) {
            console.warn("Error deteniendo listener:", e);
          }
          currentListenerRef.current = null;
        }

        currentMinuteKeyRef.current = minuteKey;

        const fixtureId = import.meta.env.VITE_FIREBASE_FIXTURE_ID || "5ff653se2gnpi4y9a4nus4xec";
        const eventsPath = feedPath || `apiopta/live_feed/${fixtureId}`;
        const eventsRef = ref(dbRef.current, eventsPath);
        currentMinuteRef.current = eventsRef;

        if (!processedByMinuteRef.current.has(minuteKey)) {
          processedByMinuteRef.current.set(minuteKey, new Set());
        }

        const processedSet = processedByMinuteRef.current.get(minuteKey);
        const useSyncSchedule = Boolean(feedPath && syncInfoRef.current);

        if (useSyncSchedule) {
          try {
            const syncMts = syncInfoRef.current.matchTimeSeconds;
            const q = query(
              eventsRef,
              orderByChild("md/match_time_seconds"),
              startAt(syncMts - BACKLOG_MS / 1000),
            );
            const snapshot = await get(q);

            if (snapshot.exists()) {
              const existing = snapshot.val();
              Object.entries(existing).forEach(([key, value]) => {
                if (processedSet.has(key)) return;
                processedSet.add(key);
                emitScheduled({
                  minuteKey,
                  eventKey: key,
                  ...value,
                  receivedAt: Date.now(),
                  isExisting: true,
                });
              });
            }
          } catch (err) {
            console.warn("Error cargando eventos sincronizados:", err);
          }
        } else if (skipExisting) {
          try {
            const snapshot = await get(eventsRef);

            if (snapshot.exists()) {
              const existingEvents = snapshot.val();
              const eventKeys = Object.keys(existingEvents);

              eventKeys.forEach((key) => {
                processedSet.add(key);
              });
            }
          } catch (err) {
            console.warn("Error verificando eventos existentes:", err);
          }
        } else {
          try {
            let q;

            if (lastTimestampRef.current) {
              q = query(
                eventsRef,
                orderByChild("timestamp"),
                startAt(lastTimestampRef.current),
              );
            } else {
              q = eventsRef;
            }

            const snapshot = await get(q);

            if (snapshot.exists()) {
              const existingEvents = snapshot.val();
              const eventEntries = Object.entries(existingEvents);

              const sortedEvents = eventEntries
                .map(([key, value]) => ({ key, ...value }))
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                .slice(0, historyLimit);

              sortedEvents.reverse().forEach((eventData) => {
                const eventKey = eventData.key;

                if (!processedSet.has(eventKey)) {
                  processedSet.add(eventKey);

                  handleNewEvent({
                    minuteKey,
                    eventKey,
                    ...eventData,
                    receivedAt: Date.now(),
                    isExisting: true,
                  });
                }
              });
            }
          } catch (err) {
            console.warn("Error cargando eventos del nuevo minuto:", err);
          }
        }

        const listenerCallback = (snapshot) => {
          const eventKey = snapshot.key;
          const eventData = snapshot.val();

          console.log("eventKey", eventKey)
          console.log("Evento:", eventData);
          
          rawEventsLogRef.current.push(eventData);

          if (minuteKey !== currentMinuteKeyRef.current) {
            return;
          }

          if (processedSet.has(eventKey)) {
            return;
          }

          processedSet.add(eventKey);

          const baseEvent = {
            minuteKey,
            eventKey,
            ...eventData,
            receivedAt: Date.now(),
            isExisting: false,
          };

          if (feedPath && syncInfoRef.current) {
            emitScheduled(baseEvent);
          } else {
            handleNewEvent(baseEvent);
          }
        };

        currentListenerRef.current = onChildAdded(
          eventsRef,
          listenerCallback,
          (error) => {
            console.error("Error en listener:", error);
            setError(error.message);
          },
        );

        setStats((prev) => ({
          ...prev,
          currentMinute: minuteKey,
        }));

        cleanupOldProcessedEvents();
      } catch (error) {
        console.error("Error en startListeningToMinute:", error);
        setError(error.message);
      } finally {
        isTransitioningRef.current = false;
      }
    },
    [handleNewEvent, cleanupOldProcessedEvents, historyLimit, feedPath, emitScheduled],
  );

  useEffect(() => {
    if (!autoConnect || !config) return;

    if (isInitializedRef.current) {
      return;
    }

    isInitializedRef.current = true;
    let isActive = true;

    const initialize = async () => {
      try {
        let app;
        try {
          app = initializeApp(config);
        } catch (error) {
          if (error.code === "app/duplicate-app") {
            app = getApp();
          } else {
            throw error;
          }
        }

        dbRef.current = getDatabase(app);

        if (!isActive) return;

        const initialMinute = getCurrentMinuteKey();
        currentMinuteKeyRef.current = initialMinute;

        await startListeningToMinute(initialMinute, true);

        if (!isActive) return;

        setIsConnected(true);
        setError(null);

        // Para feedPath (SAM3), el path es plano — no rotar listener por minuto.
        // Rotación solo aplica al path legacy program_events/{minuteKey}/events.
        if (!feedPath) {
          scheduleNextMinuteCheck();
        }
      } catch (err) {
        console.error("Error en inicialización:", err);
        if (isActive) {
          setError(err.message);
        }
      }
    };

    initialize();

    return () => {
      isActive = false;

      if (scheduleTimeoutRef.current) {
        clearTimeout(scheduleTimeoutRef.current);
        scheduleTimeoutRef.current = null;
      }

      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }

      if (currentListenerRef.current && currentMinuteRef.current) {
        try {
          off(
            currentMinuteRef.current,
            "child_added",
            currentListenerRef.current,
          );
        } catch (e) {
          console.warn("Error en cleanup:", e);
        }
      }

      currentMinuteRef.current = null;
      currentListenerRef.current = null;
      dbRef.current = null;
      processedByMinuteRef.current.clear();
      eventKeysUIRef.current.clear();
      eventBufferRef.current = [];
      lastTimestampRef.current = null;
      isInitializedRef.current = false;

      scheduledTimeoutsRef.current.forEach((t) => clearTimeout(t));
      scheduledTimeoutsRef.current.clear();
    };
  }, [getCurrentMinuteKey, startListeningToMinute, scheduleNextMinuteCheck, feedPath]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    eventKeysUIRef.current.clear();
    eventBufferRef.current = [];
    setStats((prev) => ({
      ...prev,
      totalReceived: 0,
      lastEventAt: null,
    }));
  }, []);

  const forceRefresh = useCallback(async () => {
    const currentMinute = getCurrentMinuteKey();
    await startListeningToMinute(currentMinute, true);
  }, [getCurrentMinuteKey, startListeningToMinute]);

  return {
    events,
    isConnected,
    error,
    stats,
    clearEvents,
    forceRefresh,
    downloadEventsJson,
    getServiceStats: () => ({
      isInitialized: !!dbRef.current,
      currentMinute: currentMinuteKeyRef.current,
      isListening: !!currentListenerRef.current,
      hasScheduledCheck: !!scheduleTimeoutRef.current,
      processedMinutesCount: processedByMinuteRef.current.size,
      isTransitioning: isTransitioningRef.current,
      lastTimestamp: lastTimestampRef.current,
    }),
  };
}

export default useFirebaseEvents;
