import { AnimatePresence, motion } from 'framer-motion';
import { useScoreboard } from '../../../context/Scoreboard/ScoreboardContext';
import styles from './styles.module.css';

function ScoreBubble({ score, className }) {
  return (
    <div className={`${styles.bubble} ${className ?? ''}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={score}
          className={styles.bubbleScore}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {score}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function Marcador() {
  const { state } = useScoreboard();

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar} />
      <img src="/icons/logo-exito.svg" alt="Éxito" className={styles.logo} />
      <span className={styles.labelMil}>MIL</span>
      <ScoreBubble score={state.mil} className={styles.bubbleMil} />
      <span className={styles.labelNac}>NAC</span>
      <ScoreBubble score={state.nac} className={styles.bubbleNac} />
    </div>
  );
}
