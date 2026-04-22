import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./CameraView.module.css";
import { useResultado } from "../context/ResultadoContext";
import {
  useCardModal,
  MODAL_TYPES,
} from "../context/CardModal/CardModalContext";
import { useNotifications } from "../context/Notifications/NotificationsContext";

const LOG_API_URL = "https://api-logs-errors.kontent-dev.com/api/log-fetch";

export default function ReconJson({ zoom }) {
  const videoRef = useRef(null);
  const [isActive] = useState(true);
  const [ocrCounter, setOcrCounter] = useState(0);
  const { agregarResultado } = useResultado();
  const { triggerNotification } = useNotifications();
  const [responseDebug, setResponseDebug] = useState([]);
  const [responseTest, setResponseTest] = useState([]);
  const { openModal } = useCardModal();

  useEffect(() => {
    console.log("camera view");
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara:", err);
      });

    // Cleanup: detener la cámara al desmontar
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const enviarLogAlBackend = useCallback((status, time, isOk, dataStr) => {
    fetch(LOG_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: status,
        responseTime: time,
        isOk: isOk,
        data: dataStr,
      }),
    }).catch((err) => {
      console.warn("Fallo al guardar log", err);
    });
  }, []);

  const capturarYEnviarFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    const zoomValue = Number(zoom) || 1;
    ctx.save();
    ctx.scale(zoomValue, zoomValue);
    const offsetX = (canvas.width / zoomValue - canvas.width) / 2;
    const offsetY = (canvas.height / zoomValue - canvas.height) / 2;
    ctx.drawImage(video, offsetX, offsetY, canvas.width, canvas.height);
    ctx.restore();

    // Endpoint para reconocer el logo, caja, contador
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("confidence", "0.25");

      try {
        const apiUrl = `${import.meta.env.VITE_API_MAIN_URL}sam3/process`;
        const res = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("response", data);
        // saveLogs(res.status, res.statusText, res.ok, data);
      } catch (err) {
        console.error("Error en streaming SSE:", err);
      }
    }, "image/jpeg");

    /*
    // Endpoint para reconocimiento de rostros
    try {
      const base64Image = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];

      const apiUrl = 'http://143.198.47.44:8005/api/face/recognize/base64';

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          mime_type: "image/jpeg",
          detect_multiple: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
      }

      const data = await res.json();
      agregarResultado(data?.recognitions);

    } catch (err) {
      console.error("Error enviando frame:", err);
    }
    */
  }, [zoom, agregarResultado]);

  // useEffect para el OCR (intervalo de captura)
  useEffect(() => {
    if (!isActive) return;

    const ejecutarOCR = () => {
      console.log("intervalo");
      capturarYEnviarFrame();
    };

    // Primera ejecución inmediata
    ejecutarOCR();

    // Configurar intervalo de 3 segundos
    const interval = setInterval(ejecutarOCR, 8000);

    // Cleanup: limpiar intervalo al desmontar o cuando cambie isActive
    return () => {
      clearInterval(interval);
    };
  }, [isActive, capturarYEnviarFrame]);

  return (
    <div className={styles.camer_view}>
      <div className={styles.container}>
        <div className={styles.video_container}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={styles.video_game}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
        <div className={styles.endpoint_counter_container}>
          <div
            className={styles.endpoint_counter_bar}
            style={{ width: `${ocrCounter}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
