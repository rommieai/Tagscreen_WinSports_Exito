// ChatProvider.js
import React, { useReducer } from "react";
import ChatContext from "./ChatContext";
import chatReducer from "./chatReducer";

const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, {});

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
