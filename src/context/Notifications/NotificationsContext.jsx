import { createContext, useContext, useEffect, useState } from "react";
import { notificationsConfig } from "../../components/molecules/Notifications/notificationsConfig";

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [activeNotifications, setActiveNotifications] = useState(false);

  const showNotification = (notification) => {
    setActiveNotifications(notification);
  };

  const closeNotification = () => {
    setActiveNotifications(false);
  };

  const triggerNotification = (triggerKey) => {
    const noti = triggerKey;

    if (noti) showNotification(noti);
  };

  return (
    <NotificationsContext.Provider
      value={{
        activeNotifications,
        closeNotification,
        triggerNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
