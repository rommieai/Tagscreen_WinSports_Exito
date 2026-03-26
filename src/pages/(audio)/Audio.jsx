import { useState, useRef, useEffect } from "react";
import { trackEvent } from "../../lib/firebaseAnalytics";

const AudioRecorder = () => {
  const [audios, setAudios] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
      });

      streamRef.current = stream;

      const mimeTypes = [
        "audio/mp4",
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ];

      let options = {};
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          options = {
            mimeType,
            audioBitsPerSecond: 128000,
          };
          break;
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current.mimeType;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        setAudios((prev) => [
          ...prev,
          {
            id: Date.now(),
            name: "",
            blob: blob,
            url: url,
          },
        ]);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      trackEvent("audio_recording_started");

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      alert(
        "No se pudo acceder al micrófono. Por favor verifica los permisos.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      trackEvent("audio_recording_stopped", { duration_seconds: recordingTime });
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const updateAudioName = (id, newName) => {
    setAudios((prev) =>
      prev.map((audio) =>
        audio.id === id ? { ...audio, name: newName } : audio,
      ),
    );
  };

  const deleteAudio = (id) => {
    setAudios((prev) => {
      const audio = prev.find((a) => a.id === id);
      if (audio) {
        URL.revokeObjectURL(audio.url);
      }
      return prev.filter((audio) => audio.id !== id);
    });
  };

  const sendAudios = async () => {
    if (audios.length === 0) {
      alert("No hay audios para enviar");
      return;
    }

    const audiosWithoutName = audios.filter(
      (audio) => !audio.name || audio.name.trim() === "",
    );
    if (audiosWithoutName.length > 0) {
      alert(
        "Por favor, ingresa un nombre para todos los audios antes de enviar",
      );
      return;
    }

    setIsSending(true);
    const formData = new FormData();

    audios.forEach((audio, index) => {
      const filename = `${audio.name.replace(/[^a-z0-9]/gi, "_")}.webm`;
      formData.append("audios", audio.blob, filename);
    });

    try {
      const response = await fetch(
        "https://stg-canal13-tagscreen.kontent-dev.com/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();

      if (result.ok) {
        trackEvent("audio_upload_success", { audios_count: audios.length });
        alert("¡Audios enviados correctamente!");
        // Limpiar audios después de enviar
        audios.forEach((audio) => URL.revokeObjectURL(audio.url));
        setAudios([]);
      } else {
        trackEvent("audio_upload_failed", { audios_count: audios.length });
        alert("Error al enviar los audios");
      }
    } catch (error) {
      console.error("Error:", error);
      trackEvent("audio_upload_failed", {
        audios_count: audios.length,
        message: String(error?.message || "network_error"),
      });
      alert("Error de conexión con el servidor");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: "#f8f9fa",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "30px",
          color: "#2c3e50",
          textAlign: "center",
        }}
      >
        🎙️ Grabadora de Audios
      </h2>
      <ul
        style={{
          marginTop: "10px",
          marginBottom: "10px",
          color: "#2c3e50",
          textAlign: "center",
        }}
      >
        <li style={{ marginBottom: "8px" }}>
          Graba algunos audios perfectos (Poco ruido, buen volumen) y graba
          otros realistas (un poco lejos, con ruido de fondo).
        </li>
        <li style={{ marginBottom: "8px" }}>
          Entre más audios pueda grabar, ¡mejor!
        </li>
        <li style={{ marginBottom: "8px" }}>
          Pueden ser audios de 10 segundos
        </li>
        <li>
          <strong>IMPORTANTE:</strong> El nombre del audio debe ser hora,
          minuto, segundo exacto del video. Ej: Estás grabando desde el minuto
          10:30:10 del video, el nombre del archivo debe de ser 10_30_10.
        </li>
      </ul>

      {isRecording && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#555",
              marginBottom: "8px",
            }}
          >
            🎤 Grabando...
          </div>
          <div
            style={{
              height: "4px",
              backgroundColor: "#e0e0e0",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#e74c3c",
                width: "100%",
                animation: "pulse-bar 1s ease-in-out infinite",
              }}
            ></div>
          </div>
          <style>
            {`
              @keyframes pulse-bar {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
            `}
          </style>
        </div>
      )}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        {!isRecording ? (
          <button
            onClick={startRecording}
            style={{
              padding: "15px 40px",
              fontSize: "16px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s",
              boxShadow: "0 4px 15px rgba(231, 76, 60, 0.3)",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          >
            🎤 Grabar Audio
          </button>
        ) : (
          <div>
            <button
              onClick={stopRecording}
              style={{
                padding: "15px 40px",
                fontSize: "16px",
                backgroundColor: "#34495e",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                fontWeight: "bold",
                animation: "pulse 1.5s infinite",
              }}
            >
              ⏹️ Detener ({recordingTime}s)
            </button>
            <style>
              {`
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.6; }
                }
              `}
            </style>
          </div>
        )}
      </div>

      {audios.length > 0 && (
        <div>
          <h3 style={{ color: "#34495e", marginBottom: "20px" }}>
            Audios grabados ({audios.length})
          </h3>

          {audios.map((audio) => (
            <div
              key={audio.id}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "15px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#555",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Nombre del audio:
                </label>
                <input
                  type="text"
                  value={audio.name}
                  placeholder="hora_minuto_segundo"
                  onChange={(e) => updateAudioName(audio.id, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 0.3s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3498db")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <audio
                  controls
                  src={audio.url}
                  style={{
                    flex: 1,
                    height: "40px",
                  }}
                />
                <button
                  onClick={() => deleteAudio(audio.id)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#c0392b")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#e74c3c")
                  }
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}

          {/* Botón de enviar */}
          <button
            onClick={sendAudios}
            disabled={isSending}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              backgroundColor: isSending ? "#95a5a6" : "#27ae60",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isSending ? "not-allowed" : "pointer",
              fontWeight: "bold",
              marginTop: "20px",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              !isSending && (e.target.style.backgroundColor = "#229954")
            }
            onMouseOut={(e) =>
              !isSending && (e.target.style.backgroundColor = "#27ae60")
            }
          >
            {isSending ? "⏳ Enviando..." : "📤 Enviar Audios al Servidor"}
          </button>
        </div>
      )}

      {audios.length === 0 && !isRecording && (
        <p
          style={{
            textAlign: "center",
            color: "#7f8c8d",
            fontSize: "14px",
            marginTop: "20px",
          }}
        >
          No hay audios grabados. Presiona el botón para comenzar.
        </p>
      )}
    </div>
  );
};

export default AudioRecorder;
