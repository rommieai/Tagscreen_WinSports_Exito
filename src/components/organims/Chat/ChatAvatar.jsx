import React from "react";
import style from "./style.module.css";
import ChatContent from "./ChatContent";

const ChatAvatar = ({ conversationFlow, onSpecialOption, image }) => {
  return (
    <div className={style.chat_xavy}>
      <ChatContent
        conversationFlow={conversationFlow}
        onSpecialOption={onSpecialOption}
        image={image}
      />
    </div>
  );
};

export default ChatAvatar;
