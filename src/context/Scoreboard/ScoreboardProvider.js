// ScoreboardProvider.js
import React, { useReducer } from "react";
import ScoreboardContext from "./ScoreboardContext";
import scoreboardReducer from "./scoreboardReducer";

const ScoreboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(scoreboardReducer, {});

  return (
    <ScoreboardContext.Provider value={{ state, dispatch }}>
      {children}
    </ScoreboardContext.Provider>
  );
};

export default ScoreboardProvider;
