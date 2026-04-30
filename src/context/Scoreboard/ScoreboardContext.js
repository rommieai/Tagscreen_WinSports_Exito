import { createContext, useContext } from "react";

const ScoreboardContext = createContext();

export const useScoreboard = () => useContext(ScoreboardContext);

export default ScoreboardContext;
