import React, { useState, useRef, useEffect } from "react";
import styles from "./style.module.css";
import DataUsageTracker from "./DataUsageTracker.jsx";

const ENDPOINT =
  "https://audio-correlator-779638864982.us-central1.run.app/api/v1/audio/detect-offset";
const RECORDING_DURATION = 15000;

import {
  MediaRecorder as ExtendableMediaRecorder,
  register,
} from "extendable-media-recorder";
import { connect } from "extendable-media-recorder-wav-encoder";

let isWavEncoderReady = false;

const DetectorAudio = ({ onAudioDetection }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    const setupWavEncoder = async () => {
      if (!isWavEncoderReady) {
        try {
          await register(await connect());
          isWavEncoderReady = true;
        } catch (e) {
          console.error("Error al cargar codificador WAV:", e);
          setError("Error inicializando el sistema de audio.");
        }
      }
    };
    setupWavEncoder();
    setTimeout(() => {
      startRecording();
    }, 1000);
  }, []);

  const startRecording = async () => {
    if (!isWavEncoderReady) {
      setError(
        "El sistema de audio aún no está listo. Intenta de nuevo en un momento.",
      );
      return;
    }
    try {
      setResult(null);
      setError(null);
      setLoading(false);
      setTimeLeft(15);
      setAudioUrl(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
      });

      const mediaRecorder = new ExtendableMediaRecorder(stream, {
        mimeType: "audio/wav",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleSendAudio;

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, RECORDING_DURATION);
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      setError("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current?.stream
        ?.getTracks()
        ?.forEach((track) => track.stop());
    }
  };

  const handleSendAudio = async () => {
    setLoading(true);

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    const formData = new FormData();
    formData.append("audio", audioBlob, "mic_audio.wav");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error server (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Respuesta:", data);
      setResult(data);

      if (data?.success && onAudioDetection) {
        const offset = data?.data?.offset_seconds || 0;
        onAudioDetection(true, offset);
      }
    } catch (err) {
      console.error("❌ Error en la petición:", err);
      setError(err.message || "Error al conectar con el servidor.");

      if (onAudioDetection) {
        onAudioDetection(false, 0);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <DataUsageTracker />
      {!isRecording ? (
        <button
          className={styles.button}
          onClick={startRecording}
          disabled={loading || (error && !isWavEncoderReady)}
        >
          {loading ? "Procesando..." : "Grabar"}
        </button>
      ) : (
        <button
          className={`${styles.button} ${styles.recording}`}
          onClick={stopRecording}
        >
          Detener ({timeLeft}s)
        </button>
      )}

      {loading && (
        <div className={styles.status}>Enviando WAV y analizando...</div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {audioUrl && <div className={styles.audioPlayer}></div>}

      {result && (
        <div className={styles.resultBox}>
          <p>Audio grabado:</p>
          <audio ref={audioPlayerRef} controls className={styles.audioControl}>
            <source src={audioUrl} type="audio/wav" />
            Tu navegador no soporta la reproducción de audio.
          </audio>
          <p style={{ color: "#0f0" }}>
            <strong style={{ color: "#0f0" }}>Offset:</strong>{" "}
            {result?.data?.offset_seconds?.toFixed(2)} segundos
          </p>
          <p style={{ color: "#0f0" }}>
            <strong style={{ color: "#0f0" }}>Score: </strong>
            {result?.data?.score?.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default DetectorAudio;
