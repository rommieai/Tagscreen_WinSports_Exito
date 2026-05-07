import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { motion } from "framer-motion";
import { useActiveComponents } from "../../../context/ActiveChatContext";
import {
  MODAL_TYPES,
  useCardModal,
} from "../../../context/CardModal/CardModalContext";
import { useNotifications } from "../../../context/Notifications/NotificationsContext";

const SUGGESTIONS = [
  { text: "¿Qué tengo que hacer?", next: "n2" },
  { text: "¿Cuáles son los premios?", next: "n3" },
];

export default function InputChat({ stateComponent }) {
  const [showMenu, setShowMenu] = useState(false);
  const [inputClicked, setInputClicked] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { openModal, modalData, activateChat, triggerChatScroll } = useCardModal();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMenu(true);
      openModal(MODAL_TYPES.CHAT, { autoOpen: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!modalData) {
      if (showMenu) {
        setShowMenu(false);
        setInputClicked(false);
        setShowSuggestions(false);
      }
    }
  }, [modalData]);

  const handleClickInput = () => {
    if (!inputClicked) {
      setInputClicked(true);
      setShowSuggestions(true);
    }
    if (showMenu) {
      triggerChatScroll();
    } else {
      setShowMenu(true);
      openModal(MODAL_TYPES.CHAT, { autoOpen: false });
    }
  };

  const handleSuggestionClick = (e, option) => {
    e.stopPropagation();
    setShowSuggestions(false);
    activateChat(option);
    triggerChatScroll();
  };

  return (
    <div className={styles.containerInput} onClick={handleClickInput}>
      {showSuggestions && (
        <div className={styles.subMenu}>
          {SUGGESTIONS.map((option, i) => (
            <button
              key={i}
              className={styles.itemMenu}
              onClick={(e) => handleSuggestionClick(e, option)}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}
      <div className={styles.avatarImage}>
        <img src="/icons/ico-input-chat.svg" alt="Mensajero Meli" />
      </div>
      {!inputClicked && (
        <p className={styles.textInput}>
          Toca aquí y resolveré tus dudas
        </p>
      )}
      <motion.img
        src="/images/arrow-send.svg"
        alt="Ico Send"
        className={styles.icoSend}
        animate={{ rotate: inputClicked ? 270 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </div>
  );
}
