import { motion, AnimatePresence } from "framer-motion";
import style from "./style.module.css";

import NotificationItem from "./NotificationItem";
import { useNotifications } from "../../../context/Notifications/NotificationsContext";
import { useEffect, useState } from "react";
import { notificationsConfig } from "./notificationsConfig";

export default function Notifications() {
  const { activeNotifications } = useNotifications();
  const [textNotification, setTextNotification] = useState(false);
  const [imgNotification, setImgNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!activeNotifications) return;

    const notificationData = notificationsConfig.find(
      (config) => config.triggerKey === activeNotifications,
    );

    if (!notificationData) return;

    setTextNotification(notificationData?.text);
    setImgNotification(notificationData?.img || null);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [activeNotifications]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={activeNotifications}
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <NotificationItem notification={textNotification} img={imgNotification} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
