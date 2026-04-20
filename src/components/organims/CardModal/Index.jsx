import style from "./styles.module.css";
import {
  useCardModal,
  MODAL_TYPES,
} from "../../../context/CardModal/CardModalContext";
import { motion, AnimatePresence } from "framer-motion";
import ModalChat from "../../molecules/Modals/ModalChat/ModalChat";
import ModalProduct from "../../molecules/Modals/ModalProduct/ModalProduct";
import ModalTrivia from "../../molecules/Modals/ModalTrivia/Index";
import ModalMinuteToMinute from "../../molecules/Modals/ModalMinuteToMinute/ModalMinuteToMinute";
import ModalMinuteToMinuteSam3 from "../../molecules/Modals/ModalMinuteToMinuteSam3/ModalMinuteToMinuteSam3";
import { useActiveComponents } from "../../../context/ActiveChatContext";
import { useTarget } from "../../../context/TargetContext";
import { useEffect, useRef } from "react";
import { useSession } from "../../../context/Session/SessionContext";
import { trackEvent } from "../../../lib/firebaseAnalytics";
function getPopupGroup(modalType, modalData) {
  if (modalData?.name === "meli") return "logos";
  if (modalType === MODAL_TYPES.PRODUCT) {
    return "logos";
  }
  return "general";
}

export default function CardModal() {
  const { isOpen, modalType, modalData, closeModal } = useCardModal();
  const { targetState, setTargetState } = useTarget();
  const { localAvatars, setLocalAvatars, avatarOpened, setAvatarOpened } =
    useActiveComponents();
  const { sessionId } = useSession();
  const popupInteractedRef = useRef(false);
  const openedAtRef = useRef(0);
  const prevOpenRef = useRef(false);
  const closeReasonRef = useRef("system");
  const openedTypeRef = useRef("unknown");
  const openedGroupRef = useRef("general");
  const openedDataRef = useRef(null);
  const popupGroup = getPopupGroup(modalType, modalData);

  useEffect(() => {
    setTargetState(isOpen);
  }, [isOpen, setTargetState]);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      popupInteractedRef.current = false;
      openedAtRef.current = Date.now();
      closeReasonRef.current = "system";
      openedTypeRef.current = modalType || "unknown";
      openedGroupRef.current = popupGroup;
      openedDataRef.current = modalData || null;

      trackEvent("modal_open", {
        session_id: sessionId || undefined,
        tipo_modal: modalType || "unknown",
        tipo_reconocimiento: modalData?.type || undefined,
        indice_reconocido:
          modalData?.type === "box"
            ? modalData?.num_caja
            : modalData?.type === "logo"
            ? modalData?.num_logo
            : undefined,
      });
    }

    if (!isOpen && prevOpenRef.current) {
      const tiempo_permanencia_seg = Math.max(
        1,
        Math.round((Date.now() - openedAtRef.current) / 1000),
      );

      trackEvent("modal_close", {
        session_id: sessionId || undefined,
        tipo_modal: openedTypeRef.current,
        tipo_reconocimiento: openedDataRef.current?.type || undefined,
        indice_reconocido:
          openedDataRef.current?.type === "box"
            ? openedDataRef.current?.num_caja
            : openedDataRef.current?.type === "logo"
            ? openedDataRef.current?.num_logo
            : undefined,
        tiempo_permanencia_seg,
        con_interaccion: popupInteractedRef.current,
      });
    }

    prevOpenRef.current = isOpen;
  }, [isOpen, modalType, popupGroup, modalData, sessionId]);

  if (!isOpen) return null;

  const renderModalContent = () => {
    switch (modalType) {
      case MODAL_TYPES.PRODUCT:
        return <ModalProduct data={modalData} onClose={closeModal} />;
      case MODAL_TYPES.CHAT:
        return <ModalChat data={modalData} onClose={closeModal} />;
      case MODAL_TYPES.TRIVIA:
        return <ModalTrivia data={modalData} onClose={closeModal} />;
      case MODAL_TYPES.MINUTE_TO_MINUTE:
        return <ModalMinuteToMinute data={modalData} onClose={closeModal} />;
      case MODAL_TYPES.MINUTE_TO_MINUTE_SAM3:
        return <ModalMinuteToMinuteSam3 data={modalData} onClose={closeModal} />;
      default:
        return null;
    }
  };

  const typeClassMap = {
    [MODAL_TYPES.PRODUCT]: style.product,
    [MODAL_TYPES.CHAT]: style.chatModal,
    [MODAL_TYPES.TRIVIA]: style.trivia,
    [MODAL_TYPES.MINUTE_TO_MINUTE]: style.minuteToMinute,
    [MODAL_TYPES.MINUTE_TO_MINUTE_SAM3]: style.minuteToMinute,
  };

  const handleClick = (name) => {
    closeReasonRef.current = "close_icon";
    closeModal(name);
    avatarOpened && setAvatarOpened(null);

    if (!name) return;

    const nameToDelete = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9]/g, "")
      .trim();

    setLocalAvatars((prev) =>
      prev.filter((avatar) => avatar.name !== nameToDelete),
    );
  };

  const contentClassName = [style.cardContainer, typeClassMap[modalType]]
    .filter(Boolean)
    .join(" ");

  const icoClose = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 25 25"
      fill="none"
    >
      <path
        d="M12.5 25C19.4036 25 25 19.4036 25 12.5C25 5.59644 19.4036 0 12.5 0C5.59644 0 0 5.59644 0 12.5C0 19.4036 5.59644 25 12.5 25Z"
        fill="white"
      />
      <path
        d="M14.7748 12.5001L17.6784 9.59648C17.7922 9.48254 17.8561 9.3281 17.8561 9.16708C17.8561 9.00605 17.7922 8.85161 17.6784 8.73767L16.2626 7.32063C16.1487 7.20685 15.9942 7.14294 15.8332 7.14294C15.6722 7.14294 15.5178 7.20685 15.4038 7.32063L12.5002 10.2242L9.5966 7.32063C9.48266 7.20685 9.32822 7.14294 9.1672 7.14294C9.00617 7.14294 8.85173 7.20685 8.73779 7.32063L7.32075 8.73767C7.20697 8.85161 7.14307 9.00605 7.14307 9.16708C7.14307 9.3281 7.20697 9.48254 7.32075 9.59648L10.2244 12.5001L7.32075 15.4037C7.20697 15.5176 7.14307 15.6721 7.14307 15.8331C7.14307 15.9941 7.20697 16.1486 7.32075 16.2625L8.73779 17.6795C8.85173 17.7933 9.00617 17.8572 9.1672 17.8572C9.32822 17.8572 9.48266 17.7933 9.5966 17.6795L12.5002 14.7759L15.4038 17.6795C15.5178 17.7933 15.6722 17.8572 15.8332 17.8572C15.9942 17.8572 16.1487 17.7933 16.2626 17.6795L17.6797 16.2625C17.7934 16.1486 17.8574 15.9941 17.8574 15.8331C17.8574 15.6721 17.7934 15.5176 17.6797 15.4037L14.7748 12.5001Z"
        fill="#011C63"
      />
    </svg>
  );

  const overlayVariants = {
    hidden: {
      opacity: 0,
      bottom: "0px",
    },
    visible: {
      opacity: 1,
      bottom: "75px",
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className={style.cardModalOverlay}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit={{
        opacity: 0,
        bottom: "50px",
        transition: { duration: 0.4 },
      }}
    >
      <div
        className={style.closeIcon}
        onClick={() => handleClick(modalData?.name)}
      >
        {icoClose}
      </div>
      <div
        className={contentClassName}
        onClickCapture={() => {
          popupInteractedRef.current = true;
        }}
      >
        {renderModalContent()}
      </div>
    </motion.div>
  );
}
