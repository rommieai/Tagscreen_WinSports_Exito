import { useRef, useEffect, useState } from "react";
import { TargetProvider } from "../../context/TargetContext";
import css from "./juego.module.css";
import GameUI from "../../components/organims/GameUI/Index";
import GameModal from "../../components/organims/CardModal/Index";
import DetectorTv from "../../components/molecules/DetectorTv/Index";
import { useResultado } from "../../context/ResultadoContext";
import TargetIco from "../../components/atoms/TargetIco";
import CameraView from "../../components/CameraView";
import useFirebaseEvents from "../../hooks/useFirebaseEvents";
import InputChat from "../../components/atoms/InputChat/Index";
import { useNotifications } from "../../context/Notifications/NotificationsContext";
import {
  useCardModal,
  MODAL_TYPES,
} from "../../context/CardModal/CardModalContext";
import DetectorAudio from "../../components/molecules/DetectorAudio/DetectorAudio";
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

const Juego = () => {
  const gamePageRef = useRef(null);
  const [isTvDetected, setIsTvDetected] = useState(false);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [errorResponse, setErrorResponse] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [audioOffset, setAudioOffset] = useState(0);
  const { agregarResultado } = useResultado();
  const { openModal, closeModal } = useCardModal();
  const isStream = import.meta.env.VITE_BACK_ACTIVE_STREAM === "true";
  const [boxRecognized, setIsBoxRecognized] = useState(false);
  const [audioDetected, setAudioDetected] = useState(null);
  const { triggerNotification } = useNotifications();
  const trackedLogosRef = useRef(new Set());

  const productSequence = [
    { type: "box", num: 0 },
    { type: "box", num: 1 },
    { type: "box", num: 2 },
    { type: "box", num: 3 },
    { type: "logo", num: 0 },
    { type: "logo", num: 1 },
    { type: "logo", num: 2 },
  ];

  const productIndexRef = useRef(0);

  const handleProductButton = () => {
    const current = productSequence[productIndexRef.current];
    const data =
      current.type === "box"
        ? { type: "box", num_caja: current.num }
        : { type: "logo", num_logo: current.num };
    openModal(MODAL_TYPES.PRODUCT, data);
    productIndexRef.current = (productIndexRef.current + 1) % productSequence.length;
  };

  const { events, isConnected, error, stats, getServiceStats, downloadEventsJson } =
    useFirebaseEvents(firebaseConfig, {
      maxEvents: 1,
      autoConnect: isStream && audioOffset !== null,
      audioOffset: 0,
    });

  useEffect(() => {
    console.log("Events:", events);
    if (events.length === 0) return;

    const ultimoEvento = events[events.length - 1];

    const metadata = ultimoEvento?.md;


    if (metadata?.objects?.length > 0) {
      const logoDetectionCounter = Number(
        localStorage.getItem("logo-detection-counter") || "0",
      );
      const boxDetection = metadata.objects.find(
        (obj) => obj.type === "caja" && obj.confidence >= 0.5,
      );
      const logo = metadata.objects.find(
        (obj) => obj.type === "logo" && obj.confidence >= 0.6,
      );

      if (boxDetection) {
        triggerNotification("recogBox");
        const dataModal = { type: "box", num_caja: boxDetection.num_caja };
        openModal(MODAL_TYPES.PRODUCT, dataModal);
      }

      if (logo) {
        triggerNotification("recogLogo");
        const dataModal = { type: "logo", num_logo: logo.num_logo };
        openModal(MODAL_TYPES.PRODUCT, dataModal);

        if (!trackedLogosRef.current.has(logo.num_logo)) {
          trackedLogosRef.current.add(logo.num_logo);
        }
      }
    }
  }, [events, agregarResultado]);

  useEffect(() => {
    let stream = null;

    triggerNotification("firstNotification");

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
            aspectRatio: { ideal: 16 / 9 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch((e) => console.warn("play error", e));
          };
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        setErrorResponse("No se pudo acceder a la cámara");
        setLoading(false);
      }
    };

    startCamera();

    setTimeout(() => {
      console.log('print')
      openModal(MODAL_TYPES.MINUTE_TO_MINUTE, 'data');
    }, 3000);


    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleAudioDetection = (isAudioDetected, offset = 0) => {
    setAudioDetected(isAudioDetected);
    setAudioOffset(offset);
  };

  return (
    <TargetProvider>
      <div className={css.game_page} ref={gamePageRef}>
        <TargetIco tvDetected={isTvDetected} audioState={audioDetected} />
        <div className={css.containerVideo}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={css.video_game}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {confidence >= 48 && (
            <div className={css.confidence}>Detectado: {confidence}%</div>
          )}
        </div>
        {!isTvDetected && (
          <>
            {loading && (
              <div className={css.loading}>Cargando modelo de detección...</div>
            )}

            {errorResponse && <div className={css.error}>{errorResponse}</div>}

            <DetectorTv
              videoRef={videoRef}
              onDetect={(detected, percentage, category) => {
                setIsTvDetected(detected);
                setConfidence(percentage);
              }}
              setLoading={setLoading}
              setErrorResponse={setErrorResponse}
            />
          </>
        )}
        {/* Testing products, download events json, audiodetect */}
        {/*<DetectorAudio onAudioDetection={handleAudioDetection} />
        <button className={css.cleanButton} onClick={handleProductButton}>
          Producto
        </button>
        <button className={css.cleanButton} onClick={downloadEventsJson} style={{ top: "60px", background: "#f00" }}>
          Desc. JSON
        </button>*/}
        {!isTvDetected && (
          <div className={css.container}>
            <GameUI />
            <GameModal />
            <InputChat />
          </div>
        )}
      </div>
    </TargetProvider>
  );
};

export default Juego;