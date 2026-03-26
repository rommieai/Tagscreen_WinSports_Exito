// NotificationsProvider.js
import React, { useReducer } from "react";
import NotificationsContext from "./NotificationsContext";
import notificationsReducer from "./notificationsReducer";

const NotificationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationsReducer, {});

  return (
    <NotificationsContext.Provider value={{ state, dispatch }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
