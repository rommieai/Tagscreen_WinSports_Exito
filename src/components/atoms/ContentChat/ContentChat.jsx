import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./styles.module.css";
import { useActiveComponents } from "../../../context/ActiveChatContext";
import TabInformation from "../TabsChat/TabInformation/Index";
import TabStatistics from "../TabsChat/TabStatistics";
import TabTraining from "../TabsChat/TabTraining";

export default function ContentChat({ activeComponents, initialData }) {
  const { setGeneralNotificationState, finalChat, setFinalChat } =
    useActiveComponents();
  const [activeTab, setActiveTab] = useState(0);

  const tabContents = [
    <TabInformation initialData={initialData} />,
    <TabTraining initialData={initialData} />,
    <TabStatistics initialData={initialData} />,
  ];

  return (
    <div className={styles.contentChat}>
      {activeComponents && !finalChat && (
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
              <img src="/images/visa-logo.png" alt="Visa logo" />
            </div>
            <div
              className={`${styles.tab} ${
                activeTab === 0 ? styles.tabActive : ""
              }`}
              onClick={() => {
                setActiveTab(0);
                setGeneralNotificationState(false);
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
                setGeneralNotificationState(false);
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
                setGeneralNotificationState(false);
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
              <div className={styles.brandIco}>
                <img src="/images/visa-logo.png" alt="Visa logo" />
              </div>
              {tabContents[activeTab]}
            </div>
          </motion.div>
        </>
      )}
      {finalChat && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className={styles.finalChat}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 20,
            delay: 0.7,
          }}
        >
          <div className={styles.brandIco}>
            <img src="/images/visa-logo.png" alt="Visa logo" />
          </div>
          <img
            className={styles.imageMessage}
            src="/images/card-final-conversation.png"
            alt="Final Estadisticas"
          />
        </motion.div>
      )}
    </div>
  );
}
