// CardModalProvider.js
import React, { useReducer } from "react";
import CardModalContext from "./CardModalContext";
import cardModalReducer from "./cardModalReducer";

const CardModalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cardModalReducer, {});

  return (
    <CardModalContext.Provider value={{ state, dispatch }}>
      {children}
    </CardModalContext.Provider>
  );
};

export default CardModalProvider;
