import { createContext, useContext } from "react";

export const Sam3SyncContext = createContext(null);

export const useSam3Sync = () => useContext(Sam3SyncContext);
