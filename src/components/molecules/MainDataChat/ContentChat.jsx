import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./styles.module.css";

export default function ContentChat({ activeComponents }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabContents = [
    <img
      className={styles.imageMessage}
      src="/images/mainChat/main-data.png"
      alt="Card Information"
    />,
    <div className={styles.multipleImages}>
      <img
        className={styles.imageMessage}
        src="/images/mainChat/formacion-nal.png"
        alt="Card Information"
      />
      <img
        className={styles.imageMessage}
        src="/images/mainChat/formacion-mill.png"
        alt="Card Information"
      />
    </div>,
    <img
      className={styles.imageMessage}
      src="/images/mainChat/main-estadisticas.png"
      alt="Card Information"
    />,
  ];

  return (
    <div className={styles.contentChat}>
        <>
          <motion.div
            className={styles.mainTabs}
            initial={{ opacity: 0, top: -20 }}
            animate={{ opacity: 1, top: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 20,
              duration: 0.6,
              delay: 0.5,
            }}
          >
            <div className={styles.brandIco}>
              <img src="/icons/ico-input-chat.svg" alt="Visa logo" />
            </div>
            <div
              className={`${styles.tab} ${
                activeTab === 0 ? styles.tabActive : ""
              }`}
              onClick={() => {
                setActiveTab(0);
              }}
            >
              Información
            </div>
            <div
              className={`${styles.tab} ${
                activeTab === 1 ? styles.tabActive : ""
              }`}
              onClick={() => {
                setActiveTab(1);
              }}
            >
              Formaciones
            </div>
            <div
              className={`${styles.tab} ${
                activeTab === 2 ? styles.tabActive : ""
              }`}
              onClick={() => {
                setActiveTab(2);
              }}
            >
              Estadísticas
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 20,
              delay: 0.7,
            }}
          >
            <div className={styles.tabContent}>
              {tabContents[activeTab]}
            </div>
          </motion.div>
        </>
    </div>
  );
}
