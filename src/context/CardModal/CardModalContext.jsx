import React, { createContext, useContext, useState, useCallback } from "react";
import { useActiveComponents } from "../ActiveChatContext";

// Modal types enabled
export const MODAL_TYPES = {
  MINUTE_TO_MINUTE: "minuteToMinute",
  MINUTE_TO_MINUTE_SAM3: "minuteToMinuteSam3",
  BOX_INFO: "boxInfo",
  PLAYER_PICK: "playerPick",
  PLAYER_INFO: "playerInfo",
  TRIVIA: "trivia",
  PRODUCT: "product",
  CHAT: "chat",
  BRAND_INFO: "brandInfo",
};

const CardModalContext = createContext(null);

export const CardModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [goalData, setGoalData] = useState(null);
  const [chatActivated, setChatActivated] = useState(false);
  const [chatScrollTrigger, setChatScrollTrigger] = useState(0);

  const {
    setModelChat,
    setHideSubMenu,
    setFinalChat,
    setKillChat,
    setActiveComponents,
  } = useActiveComponents();

  const openModal = useCallback(
    (type, data = null) => {
      setModalType(type);
      setModalData(data);
      setIsOpen(true);
      setModelChat(null);
      setHideSubMenu(true);
      setFinalChat(false);
      setKillChat(true);
      setActiveComponents(false);
    },
    [
      setModelChat,
      setHideSubMenu,
      setFinalChat,
      setKillChat,
      setActiveComponents,
    ],
  );

  const activateChat = useCallback(() => {
    setChatActivated(true);
  }, []);

  const triggerChatScroll = useCallback(() => {
    setChatScrollTrigger((prev) => prev + 1);
  }, []);

  // Closes the modal
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalType(null);
    setModalData(null);
    setChatActivated(false);
  }, []);

  return (
    <CardModalContext.Provider
      value={{
        isOpen,
        modalType,
        modalData,
        openModal,
        closeModal,
        playerName,
        setPlayerName,
        goalData,
        setGoalData,
        chatActivated,
        activateChat,
        chatScrollTrigger,
        triggerChatScroll,
      }}
    >
      {children}
    </CardModalContext.Provider>
  );
};

export const useCardModal = () => {
  const context = useContext(CardModalContext);
  if (!context) {
    throw new Error("useCardModal must be used within a CardModalProvider");
  }
  return context;
};
