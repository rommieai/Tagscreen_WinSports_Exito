import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./detectionbox.module.css";

export default function DetectionBox({ x1, y1, x2, y2, width, height }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800); // 2 segundos

    return () => clearTimeout(timer); // limpieza
  }, []);

  const left = x1 * width;
  const top = y1 * height;
  const boxWidth = (x2 - x1) * width;
  const boxHeight = (y2 - y1) * height;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.4 }}
          className={styles.box}
          style={{
            left,
            top,
            width: boxWidth,
            height: boxHeight,
          }}
        />
      )}
    </AnimatePresence>
  );
}
