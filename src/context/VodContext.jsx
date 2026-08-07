import { createContext, useContext } from "react";

const VodContext = createContext({ fixtureId: null });

export function VodProvider({ fixtureId, children }) {
  return (
    <VodContext.Provider value={{ fixtureId }}>
      {children}
    </VodContext.Provider>
  );
}

export function useVodContext() {
  return useContext(VodContext);
}
