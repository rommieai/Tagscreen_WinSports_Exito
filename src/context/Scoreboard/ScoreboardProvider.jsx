import { useReducer, useCallback } from "react";
import ScoreboardContext from "./ScoreboardContext";
import scoreboardReducer from "./scoreboardReducer";

const ScoreboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(scoreboardReducer, { mil: 0, nac: 0 });

  const addGoal = useCallback((team) => {
    dispatch({ type: 'ADD_GOAL', team });
  }, []);

  return (
    <ScoreboardContext.Provider value={{ state, addGoal }}>
      {children}
    </ScoreboardContext.Provider>
  );
};

export default ScoreboardProvider;
