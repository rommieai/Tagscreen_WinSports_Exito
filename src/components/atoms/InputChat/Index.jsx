import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { motion } from "framer-motion";
import { useActiveComponents } from "../../../context/ActiveChatContext";
import {
  MODAL_TYPES,
  useCardModal,
} from "../../../context/CardModal/CardModalContext";
import { useNotifications } from "../../../context/Notifications/NotificationsContext";

export default function InputChat({ stateComponent }) {
  const [showMenu, setShowMenu] = useState(false);
  const [inputClicked, setInputClicked] = useState(false);
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
      }
    }
  }, [modalData]);

  const handleClickInput = () => {
    setInputClicked(true);
    if (showMenu) {
      activateChat();
      triggerChatScroll();
    } else {
      setShowMenu(true);
      openModal(MODAL_TYPES.CHAT, { autoOpen: false });
    }
  };

  return (
    <div
      className={styles.containerInput}
      onClick={() => {
        handleClickInput();
      }}
    >
      <div className={styles.avatarImage}>
        <img
          src="/images/avatar/mensajero-avatar.png"
          alt="Mensajero Meli"
        ></img>
      </div>
      {!inputClicked && (
        <p className={styles.textInput}>
          Soy tu mensajero ¡escríbeme tus dudas!
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
