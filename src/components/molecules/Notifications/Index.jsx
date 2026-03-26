import { motion, AnimatePresence } from "framer-motion";
import style from "./style.module.css";

import NotificationItem from "./NotificationItem";
import { useNotifications } from "../../../context/Notifications/NotificationsContext";
import { useEffect, useState } from "react";
import { notificationsConfig } from "./notificationsConfig";

export default function Notifications() {
  const { activeNotifications } = useNotifications();
  const [textNotification, setTextNotification] = useState(false);

  useEffect(() => {
    if (!activeNotifications) return;

    const notificationData = notificationsConfig.find(
      (config) => config.triggerKey === activeNotifications,
    );

    if (!notificationData) return;

    setTextNotification(notificationData?.text);
  }, [activeNotifications]);

  useEffect(() => {
    if (!activeNotifications) return;

    const timer = setTimeout(() => {
      setTextNotification(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, [activeNotifications]);

  return (
    activeNotifications && <NotificationItem notification={textNotification} />
  );
}
