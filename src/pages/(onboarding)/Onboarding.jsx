import { motion } from "framer-motion";
import styles from "./onboarding.module.css";
import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../../context/Session/SessionContext";
import { trackEvent } from "../../lib/firebaseAnalytics";

// SWIPER
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Onboarding() {
  const navigate = useNavigate();
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  const { sessionId } = useSession();
  const entradaRef = useRef(null);

  const swiperRef = useRef(null);
  const videoRefs = useRef([]);

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
    Math.max(
      1,
      Math.round(
        (Date.now() - (entradaRef.current || Date.now())) / 1000
      )
    );

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

  const slides = [
    {
      text: "<strong>¡Escanea</strong> las camisetas durante el partido y <strong>gana descuentos</strong> increíbles!",
      video: "https://res.cloudinary.com/dv5j3exqi/video/upload/v1776713750/winexito-onboarding1b_jklqom.mp4",
    },
    {
      text: "¡Tendrás acceso a <strong>los descuentos</strong> que has ganado durante todo el partido!",
      video: "https://res.cloudinary.com/dv5j3exqi/video/upload/v1776713749/winexito-onboarding2b_v7como.mp4",
    },
    {
      text: "¡Con el <strong>minuto a minuto</strong> no te vas a perder ningún momento del partido!",
      video: "https://res.cloudinary.com/dv5j3exqi/video/upload/v1776713751/winexito-onboarding3b_nzm6e7.mp4",
    },
    {
      text: "Si tienes preguntas, no dudes en preguntar a tu Director Técnico",
      video: "https://res.cloudinary.com/dv5j3exqi/video/upload/v1776713751/winexito-onboarding4b_brlyzn.mp4",
    },
  ];

  const handleSlideChange = (swiper) => {
    const activeIndex = swiper.activeIndex;

    // Pausar todos
    videoRefs.current.forEach((video, i) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Reproducir solo el activo
    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo) {
      activeVideo.play().catch(() => {});
    }

    trackEvent("onboarding_slide_change", {
      step: activeIndex + 1,
    });
  };

  const handleVideoEnd = (index) => {
    if (swiperRef.current && index < slides.length - 1) {
      swiperRef.current.slideTo(index + 1);
    }
  };

  return (
    <div className={styles.onboardingContainer}>
      {hasVisitedBefore && (
        <div className={styles.skipBtn} onClick={handleSkip}>
          <span>Omitir</span>
          <img src="/images/icons/ico-skip.svg" alt="Arrow Right" />
        </div>
      )}

      <Swiper
        modules={[Pagination]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={handleSlideChange}
        className={styles.swiper}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className={styles.slide}>
              <h1
                dangerouslySetInnerHTML={{ __html: slide.text }}
                className={styles.title}
              />

              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={slide.video}
                className={styles.video}
                muted
                playsInline
                preload="auto"
                onEnded={() => handleVideoEnd(index)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className={styles.btnStart}>
        <Link to="/juego" className={styles.nextBtn} onClick={handleStart}>
          Continuar
        </Link>
      </div>
    </div>
  );
}