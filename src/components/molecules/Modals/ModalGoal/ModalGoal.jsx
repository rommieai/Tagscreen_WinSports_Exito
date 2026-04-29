import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles.module.css';

const REPLAY_URL = 'https://replay.tagscreen.ai/world-cup/goal';

const WhatsAppIcon = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M9.5 0C4.253 0 0 4.253 0 9.5c0 1.66.432 3.22 1.189 4.576L0 19l5.056-1.164A9.454 9.454 0 0 0 9.5 19C14.747 19 19 14.747 19 9.5S14.747 0 9.5 0Zm-2.7 5.5c-.18-.003-.378.003-.565.44-.21.494-.8 1.96-.87 2.103-.07.143-.117.31-.023.5.093.19.14.308.28.474.14.166.294.37.42.498.14.14.284.29.122.568-.163.278-.726 1.213-1.558 1.965-1.073.96-1.98.63-2.337.445-.357-.186-.602-.31-.602-.31l-.874 1.504s.284.15.72.33c.435.182 1.006.37 1.718.385.712.015 1.535-.193 2.36-.772.826-.579 1.71-1.55 2.356-2.796.647-1.247.574-2.233.39-2.88-.183-.648-.524-1.09-.88-1.394-.355-.304-.695-.46-.857-.46Z" fill="white"/>
  </svg>
);

export default function ModalGoal() {
  const [showScore, setShowScore] = useState(false);
  const [milloScore, setMilloScore] = useState(0);
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowScore(true), 3000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (!showScore) return;
    const t2 = setTimeout(() => setMilloScore(1), 1000);
    return () => clearTimeout(t2);
  }, [showScore]);

  useEffect(() => {
    if (milloScore !== 1) return;
    const t3 = setTimeout(() => setShowReplay(true), 3000);
    return () => clearTimeout(t3);
  }, [milloScore]);

  const handleShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(REPLAY_URL)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.wrapper}>
      <AnimatePresence mode="wait">
        {!showScore && (
          <motion.div
            key="gol"
            className={styles.golPanel}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
          >
            <span className={styles.text}>GOOOOOOOL</span>
          </motion.div>
        )}

        {showScore && !showReplay && (
          <motion.div
            key="score"
            className={styles.scorePanel}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className={styles.scoreCard}>
              <p className={styles.teamName}>MILLONARIOS</p>
              <div className={styles.scoreBox}>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={milloScore}
                    className={styles.scoreNum}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    {milloScore}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className={styles.scoreCard}>
              <p className={styles.teamName}>NACIONAL</p>
              <div className={styles.scoreBox}>
                <span className={styles.scoreNum}>0</span>
              </div>
            </div>
          </motion.div>
        )}

        {showReplay && (
          <motion.div
            key="replay"
            className={styles.replayCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <video
              className={styles.videoThumb}
              src={REPLAY_URL}
              autoPlay
              muted
              playsInline
              loop
            />
            <p className={styles.replayText}>¡GOL! Celebra y compártelo con tus amigos</p>
            <button className={styles.shareBtn} onClick={handleShare}>
              <span className={styles.shareBtnLabel}>Compartir</span>
              <WhatsAppIcon />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
