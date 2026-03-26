// BubblesProvider.js
import React, { useReducer } from "react";
import BubblesContext from "./BubblesContext";
import bubblesReducer from "./bubblesReducer";

const BubblesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bubblesReducer, {});

  return (
    <BubblesContext.Provider value={{ state, dispatch }}>
      {children}
    </BubblesContext.Provider>
  );
};

export default BubblesProvider;
