import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../../context/Notifications/NotificationsContext";
import styles from "./style.module.css";

export default function NotificationItem({ notification }) {
  const { closeNotification } = useNotifications();

  const handleClick = () => {
    closeNotification();
  };

  return (
    <>
      <AnimatePresence>
        {notification && (
          <motion.div
            notification={notification.id}
            className={styles.notification_container}
            initial={{ opacity: 0, scale: 0, translateX: "-50%" }}
            animate={{ opacity: 1, scale: 1, translateX: "-50%" }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={`${styles.container_message} ${styles.bell_animate}`}
              onClick={() => handleClick()}
            >
              <p dangerouslySetInnerHTML={{ __html: notification }}></p>
              <div className={styles.ico_notification}>
                <img
                  src="/images/logos/logo-notification.svg"
                  alt="Logo Mercado Libre Notifacion"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
