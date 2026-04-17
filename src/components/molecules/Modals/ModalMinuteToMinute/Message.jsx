import { motion } from "framer-motion";
import styles from "./styles.module.css";

const bubbleVariants = {
  hidden: {
    opacity: 0,
    scale: 0.4,
    x: -20,
    originX: 0,
    originY: 1,
  },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 18,
      mass: 0.8,
      delay: 0.15,
    },
  },
};

function highlightTeams(text, teamHome, teamAway) {
  if (!text) return "";
  let result = text;
  if (teamHome) {
    result = result.split(teamHome).join(`<strong>${teamHome}</strong>`);
  }
  if (teamAway) {
    result = result.split(teamAway).join(`<strong>${teamAway}</strong>`);
  }
  return result;
}

export default function Message({ minute, text, teamHome, teamAway }) {
  const highlightedText = highlightTeams(text, teamHome, teamAway);

  return (
    <motion.div
      className={styles.messageBurble}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <p>
        <strong>Min {minute}:00&apos;</strong>
      </p>
      <p dangerouslySetInnerHTML={{ __html: highlightedText }} />
    </motion.div>
  );
}