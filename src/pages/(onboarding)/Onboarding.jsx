import { motion, AnimatePresence } from "framer-motion";
import styles from "./onboarding.module.css";
import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../../context/Session/SessionContext";
import { trackEvent } from "../../lib/firebaseAnalytics";

export default function Onboarding() {
  const navigate = useNavigate();
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  const { sessionId } = useSession();
  const entradaRef = useRef(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem("onboarding-visited");
    setHasVisitedBefore(!!hasVisited);
    localStorage.setItem("onboarding-visited", "true");
  }, []);

  useEffect(() => {
    entradaRef.current = Date.now();
    trackEvent("onboarding_view", {
      session_id: sessionId || undefined,
      tiene_visita_previa: !!localStorage.getItem("onboarding-visited"),
    });
  }, []);

  const getPermanencia = () =>
    Math.max(1, Math.round((Date.now() - (entradaRef.current || Date.now())) / 1000));

  const handleSkip = () => {
    trackEvent("onboarding_skip_click", {
      session_id: sessionId || undefined,
      tiempo_permanencia_seg: getPermanencia(),
      tiene_visita_previa: hasVisitedBefore,
    });
    navigate("/juego");
  };

  const handleStart = () => {
    trackEvent("onboarding_vamos_click", {
      session_id: sessionId || undefined,
      tiempo_permanencia_seg: getPermanencia(),
      tiene_visita_previa: hasVisitedBefore,
    });
  };

  const handleDotClick = (index) => {
    if (swiperInstance) {
      swiperInstance.slideTo(index);
    }
    trackEvent("onboarding_dot_click", {
      target_step: index + 1,
    });
  };

  const IcoOmitir = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
    >
      <path
        d="M12.5 1C18.8513 1 24 6.14873 24 12.5C24 18.8513 18.8513 24 12.5 24C6.14873 24 1 18.8513 1 12.5C1 6.14873 6.14873 1 12.5 1Z"
        stroke="white"
        stroke-width="2"
      />
      <path
        d="M14.4107 12.5L16.8497 14.939C16.9453 15.0347 16.999 15.1645 16.999 15.2997C16.999 15.435 16.9453 15.5647 16.8497 15.6604L15.6604 16.8507C15.5647 16.9463 15.435 17 15.2997 17C15.1645 17 15.0347 16.9463 14.939 16.8507L12.5 14.4117L10.061 16.8507C9.96526 16.9463 9.83553 17 9.70027 17C9.56501 17 9.43528 16.9463 9.33957 16.8507L8.14925 15.6604C8.05368 15.5647 8 15.435 8 15.2997C8 15.1645 8.05368 15.0347 8.14925 14.939L10.5883 12.5L8.14925 10.061C8.05368 9.96526 8 9.83553 8 9.70027C8 9.56501 8.05368 9.43528 8.14925 9.33957L9.33957 8.14925C9.43528 8.05368 9.56501 8 9.70027 8C9.83553 8 9.96526 8.05368 10.061 8.14925L12.5 10.5883L14.939 8.14925C15.0347 8.05368 15.1645 8 15.2997 8C15.435 8 15.5647 8.05368 15.6604 8.14925L16.8507 9.33957C16.9463 9.43528 17 9.56501 17 9.70027C17 9.83553 16.9463 9.96526 16.8507 10.061L14.4107 12.5Z"
        fill="white"
      />
    </svg>
  );

  return (
    <div className={styles.onboardingContainer}>
      {hasVisitedBefore && (
        <div className={styles.skipBtn} onClick={handleSkip}>
          <span>Omitir</span>
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 1C18.8513 1 24 6.14873 24 12.5C24 18.8513 18.8513 24 12.5 24C6.14873 24 1 18.8513 1 12.5C1 6.14873 6.14873 1 12.5 1Z"
              stroke="white"
              stroke-width="2"
            />
            <path
              d="M14.4107 12.5L16.8497 14.939C16.9453 15.0347 16.999 15.1645 16.999 15.2997C16.999 15.435 16.9453 15.5647 16.8497 15.6604L15.6604 16.8507C15.5647 16.9463 15.435 17 15.2997 17C15.1645 17 15.0347 16.9463 14.939 16.8507L12.5 14.4117L10.061 16.8507C9.96526 16.9463 9.83553 17 9.70027 17C9.56501 17 9.43528 16.9463 9.33957 16.8507L8.14925 15.6604C8.05368 15.5647 8 15.435 8 15.2997C8 15.1645 8.05368 15.0347 8.14925 14.939L10.5883 12.5L8.14925 10.061C8.05368 9.96526 8 9.83553 8 9.70027C8 9.56501 8.05368 9.43528 8.14925 9.33957L9.33957 8.14925C9.43528 8.05368 9.56501 8 9.70027 8C9.83553 8 9.96526 8.05368 10.061 8.14925L12.5 10.5883L14.939 8.14925C15.0347 8.05368 15.1645 8 15.2997 8C15.435 8 15.5647 8.05368 15.6604 8.14925L16.8507 9.33957C16.9463 9.43528 17 9.56501 17 9.70027C17 9.83553 16.9463 9.96526 16.8507 10.061L14.4107 12.5Z"
              fill="white"
            />
          </svg>
        </div>
      )}
      <h1 className={styles.title}>
        Escanea los <strong>logos</strong> y las <strong>cajas </strong>
        de <strong>Mercado Libre</strong> que verás en el programa de{" "}
        <strong>Tu Día</strong> y gana ;)
      </h1>
      <video
        className={styles.video}
        preload="auto"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/video-miniatura.png"
      >
        <source src={"./videos/video-onboarding-step1.mp4"} type="video/mp4" />
        Tu navegador no soporta la reproducción de video.
      </video>

      <div className={styles.btnStart}>
        <Link to="/juego" className={styles.nextBtn} onClick={handleStart}>
          Vamos
        </Link>
      </div>
    </div>
  );
}
