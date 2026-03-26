import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { basePersonajes } from "./basePersonajes";
import styles from "./style.module.css";
import { useActiveComponents } from "../../../context/ActiveChatContext";
import { useNotifications } from "../../../context/Notifications/NotificationsContext";
import {
  useCardModal,
  MODAL_TYPES,
} from "../../../context/CardModal/CardModalContext";
import { useResultado } from "../../../context/ResultadoContext";
import { useTarget } from "../../../context/TargetContext";
const AnimatedItem = ({
  name,
  image,
  isFirst = false,
  isRecog = false,
  isOpen = false,
  onClick,
}) => {
  const animations = {
    initial: { y: 150, x: 50, opacity: 1 },
    animate: { y: 0, x: 0, opacity: 1 },
    exit: { opacity: 0 },
    transition: { type: "spring", stiffness: 200, damping: 20 },
  };

  return (
    <motion.div
      layout
      className={`${styles.resultItem} ${name === "Meli" ? styles.icoGif : null} ${isRecog ? styles.isRecog : ""} ${isOpen ? styles.isOpen : ""}`}
      {...animations}
      onClick={onClick}
    >
      <div className={styles.pulseRing}></div>
      <div className={styles.pulseRing}></div>
      <div className={styles.pulseRing}></div>
      <img src={image} alt={name} className={styles.avatarImage} />
      <span>{name.split(" ")[0]}</span>
    </motion.div>
  );
};

export default function Avatars() {
  const { triggerNotification, closeNotification } = useNotifications();
  const { openModal } = useCardModal();
  const { faces } = useResultado();
  const {
    setActiveComponents,
    localAvatars,
    setLocalAvatars,
    avatarOpened,
    setAvatarOpened,
  } = useActiveComponents();
  const [isRecog, setIsRecog] = useState(null);

  useEffect(() => {
    console.log("faces", faces);
    if (!faces || faces.length === 0) return;

    setLocalAvatars((prev) => {
      const existingNames = new Set(prev.map((avatar) => avatar.name));

      const toAdd = faces.filter(
        (face, index, self) =>
          !existingNames.has(face.name) &&
          index === self.findIndex((f) => f.name === face.name)
      );

      if (toAdd.length === 0) return prev;

      trackEvent("bubble_recognized", {
        bubble_group: "faces",
        recognized_count: toAdd.length,
        names: toAdd.map((face) => face.name).slice(0, 5).join(","),
      });
      incrementAnalyticsCounter("despliegues_componente", toAdd.length);
      trackClientInteraction({
        tipo_componente: "tipc01_burbujas",
        referencia_componente: `faces_${toAdd[0].name || "unknown"}`,
        tipo_respuestas: "despliegue",
        referencia_respuesta: "recognition_faces",
      });

      closeNotification();
      triggerNotification(toAdd[0].name);

      setIsRecog(toAdd[0].name);

      setTimeout(() => {
        setIsRecog(null);
      }, 3000);

      return [...toAdd, ...prev];
    });
  }, [faces, setLocalAvatars]);

  const handleAvatarClick = (name, personId) => {
    closeNotification();

    trackEvent("bubble_interaction", {
      bubble_group: personId === "meli" ? "logos" : "faces",
      bubble_id: personId,
      bubble_name: name,
    });
    incrementAnalyticsCounter("clics_componente", 1);
    trackClientInteraction({
      tipo_componente: "tipc01_burbujas",
      referencia_componente: `com01-bur-${personId}`,
      tipo_respuestas: "click",
      referencia_respuesta: name,
    });

    if (avatarOpened && avatarOpened !== personId) {
      setLocalAvatars((prevAvatars) =>
        prevAvatars.filter((avatar) => avatar.name !== avatarOpened)
      );
    }

    setAvatarOpened(personId);
    setLocalAvatars((prevAvatars) => {
      const clickedAvatar = prevAvatars.find(
        (avatar) => avatar.name === personId
      );

      const filteredAvatars = prevAvatars.filter(
        (avatar) => avatar.name !== personId
      );

      return clickedAvatar ? [clickedAvatar, ...filteredAvatars] : prevAvatars;
    });

    if (personId === "meli") {
      openModal(MODAL_TYPES.BRAND_INFO, { name: "meli" });
    } else {
      openModal(MODAL_TYPES.PLAYER_INFO, {
        name,
      });
    }

    setActiveComponents(null);
  };

  useEffect(() => {
    if (localAvatars.length > 0) {
      const personaje = basePersonajes.find(
        (p) =>
          p.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/Ã±/g, "n")
            .replace(/[^a-z0-9]/g, "")
            .trim() === localAvatars[0].name
      );
      setActiveComponents(null);
      triggerNotification(personaje?.notification_id);

      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  }, [localAvatars]);

  const sortedAvatars = [...localAvatars].sort((a, b) => {
    if (a.name === avatarOpened) return -1;
    if (b.name === avatarOpened) return 1;
    return 0;
  });

  return (
    <>
      <div className={styles.resultsContainer}>
        <AnimatePresence>
          {sortedAvatars.map((avatar, idx) => {
            const personaje = basePersonajes.find(
              (p) =>
                p.name
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/Ã±/g, "n")
                  .replace(/[^a-z0-9]/g, "")
                  .trim() === avatar.name
            );
            if (!personaje) return null;
            return (
              <AnimatedItem
                key={personaje.personId}
                name={personaje.name}
                person_id={personaje.personId}
                image={personaje.image}
                isFirst={idx === 0}
                isRecog={isRecog === personaje.personId}
                isOpen={avatarOpened === personaje.personId}
                onClick={() =>
                  handleAvatarClick(personaje.name, personaje.personId)
                }
              />
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
