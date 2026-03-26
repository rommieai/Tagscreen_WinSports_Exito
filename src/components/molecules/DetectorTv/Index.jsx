import { useEffect, useState } from "react";
import { getTvDetector } from "@/lib/mediapipeDetector";

const DetectorTv = ({ videoRef, onDetect, setLoading, setError }) => {
  const [detector, setDetector] = useState(null);

  useEffect(() => {
    let mounted = true;

    getTvDetector()
      .then((d) => {
        if (mounted) {
          setDetector(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError("No se pudo cargar el modelo de detección");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [setLoading, setError]);

  useEffect(() => {
    if (!detector || !videoRef.current) return;

    let animationFrameId = null;
    let lastVideoTime = -1;

    const predictLoop = () => {
      const video = videoRef.current;

      if (!video || video.readyState < 2) {
        animationFrameId = requestAnimationFrame(predictLoop);
        return;
      }

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        const detections = detector.detectForVideo(video, performance.now());

        // Filtrar y buscar la mejor detección
        let bestDetection = null;
        let maxScore = 0;

        const validCategories = new Set(["tv", "monitor", "laptop"]);

        detections.detections.forEach((detection) => {
          const category = detection.categories?.[0];
          if (!category) return;

          const name = category.categoryName?.toLowerCase();
          const score = category.score;

          if (validCategories.has(name) && score >= 0.61 && score > maxScore) {
            maxScore = score;
            bestDetection = detection;
          }
        });

        let detected = false;
        let percentage = 0;
        let categoryName = "";

        if (bestDetection) {
          detected = true;
          percentage = Math.round(maxScore * 100);
          categoryName = bestDetection.categories[0].categoryName;
        }

        // Llama al callback del padre solo si confianza >= 48%
        if (percentage >= 48) {
          onDetect(true, percentage, categoryName.toLowerCase());
        } else {
          onDetect(false, percentage, categoryName.toLowerCase());
        }
      }

      animationFrameId = requestAnimationFrame(predictLoop);
    };

    predictLoop();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [detector, videoRef, onDetect]);

  // El hijo ya no renderiza nada visible; todo el UI (video, loading, error, confidence) está en el padre
  return null;
};

export default DetectorTv;
