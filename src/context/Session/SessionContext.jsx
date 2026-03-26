// SessionContext.jsx
import { createContext, useContext, useState } from "react";

const SessionContext = createContext();

export function SessionProvider({ children, initialSessionId = null }) {
  const [sessionId, setSessionId] = useState(initialSessionId);

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return context;
};