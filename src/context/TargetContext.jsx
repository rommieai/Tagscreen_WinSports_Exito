import { createContext, useContext, useState } from "react";

const TargetContext = createContext();

export function TargetProvider({ children }) {
  const [targetState, setTargetState] = useState(false);

  const mostrarTarget = () => setTargetState(true);
  const ocultarTarget = () => setTargetState(false);

  return (
    <TargetContext.Provider
      value={{
        targetState,
        setTargetState,
        mostrarTarget,
        ocultarTarget,
      }}
    >
      {children}
    </TargetContext.Provider>
  );
}

export function useTarget() {
  const context = useContext(TargetContext);
  if (!context) {
    throw new Error("useTarget debe ser usado dentro de un TargetProvider");
  }
  return context;
}
