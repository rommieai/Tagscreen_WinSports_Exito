import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles.module.css';

const REPLAY_URL = 'https://replay.tagscreen.ai/world-cup/goal';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
    <path d="M0 19L1.38462 13.9231C0.615387 12.5384 0.230771 11 0.230771 9.38461C0.230771 4.23077 4.46154 0 9.61538 0C14.7692 0 19 4.23077 19 9.38461C19 14.5385 14.7692 18.7692 9.61538 18.7692C4.46154 18.7692 6.53846 18.3846 5.15384 17.6154L0.0769277 19H0ZM5.38461 15.7692L5.6923 15.9231C6.84615 16.6154 8.23076 17 9.53845 17C13.6923 17 17.1538 13.6154 17.1538 9.38461C17.1538 5.15384 13.7692 1.76923 9.53845 1.76923C5.30768 1.76923 1.92308 5.15384 1.92308 9.38461C1.92308 13.6154 2.30769 12.1538 2.99999 13.3077L3.23077 13.6154L2.46153 16.4615L5.30768 15.6923L5.38461 15.7692Z" fill="white"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M13 10.7688C12.6154 10.5381 12.0769 10.3073 11.6923 10.4611C11.3077 10.615 11.1538 11.1534 10.9231 11.4611C10.7692 11.615 10.6923 11.615 10.4615 11.5381C9.15385 10.9996 8.15384 10.1534 7.46153 8.92267C7.30769 8.76882 7.38461 8.61498 7.46153 8.38421C7.6923 8.15344 7.92307 7.84575 7.99999 7.46113C7.99999 7.15344 7.92308 6.6919 7.76923 6.38421C7.61539 5.9996 7.38462 5.46113 7 5.23037C6.61539 4.9996 6.15385 5.15345 5.84616 5.38421C5.3077 5.84575 5 6.53806 5 7.23036C5 7.46113 5 7.61498 5 7.84575C5.07692 8.30729 5.30769 8.76882 5.53846 9.15344C5.69231 9.46113 5.92308 9.76882 6.15385 10.0765C6.84615 10.9996 7.69231 11.8457 8.69231 12.4611C9.23077 12.7688 9.76922 13.0765 10.3077 13.2304C10.9231 13.4611 11.4615 13.6919 12.1538 13.5381C12.8462 13.3842 13.5385 12.9996 13.8461 12.3073C13.9231 12.0765 14 11.8457 13.9231 11.6919C13.8462 11.2304 13.2308 10.9996 12.8461 10.7688H13Z" fill="white"/>
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
