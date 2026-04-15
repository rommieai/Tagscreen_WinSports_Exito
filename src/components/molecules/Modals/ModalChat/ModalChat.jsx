import React, { useState, useEffect, useRef } from "react";
import styles from "./style.module.css";
import MessageBasic from "../../../MessageBasic/MessageBasic";
import BntBasic from "../../../atoms/btnBasic/btnBasic";
import { motion } from "framer-motion";
import { useSession } from "../../../../context/Session/SessionContext";
import { trackEvent } from "../../../../lib/firebaseAnalytics";
import { useCardModal } from "../../../../context/CardModal/CardModalContext";

const chatFlow = {
  nodes: {
    n0: {
      id: "n0",
      type: "intro",
      messages: [
        "Hola, soy el narrador Éxito. A medida que avanza el partido podrás escanear las camisetas de tu equipo favorito y recibirás grandes sorpresas. ¡Mantente conectado!",
        "Toca abajo para seguir charlando 😉",
      ],
    },
    n1: {
      id: "n1",
      type: "menu",
      messages: ["¿Qué quieres saber?"],
      options: [
        { text: "¿Qué tengo que hacer?", next: "n2" },
        { text: "¿Cuáles son los premios?", next: "n3" },
        { text: "¿Solo puedo ganar hoy?", next: "n4" },
      ],
    },
    n2: {
      id: "n2",
      type: "respuesta",
      messages: [
        "Escanea las camisetas de los jugadores y encuentra productos con descuentos increíbles en Éxito. 🙂",
        "¿Hay algo más que me quieras preguntar?",
      ],
      options: [
        { text: "¿Cuáles son los premios?", next: "n3" },
        { text: "¿Solo puedo ganar hoy?", next: "n4" },
        { text: "Nada más 😉", next: "fin", end: true },
      ],
    },
    n3: {
      id: "n3",
      type: "respuesta",
      messages: [
        "Podrás encontrar productos con descuentos increíbles en Éxito.",
        "¿Quieres que te explique algo más? 😉",
      ],
      options: [
        { text: "¿Qué tengo que hacer?", next: "n2" },
        { text: "¿Solo puedo ganar hoy?", next: "n4" },
        { text: "Nada más 😉", next: "fin", end: true },
      ],
    },
    n4: {
      id: "n4",
      type: "respuesta",
      messages: [
        "Con Win y Almacenes Éxito podrás buscar ofertas en todas las fechas del torneo. No dejes de buscar tus productos favoritos. ¡Cada partido es una oportunidad!",
        "¿Quieres que te explique algo más? 😉",
      ],
      options: [
        { text: "¿Qué tengo que hacer?", next: "n2" },
        { text: "¿Cuáles son los premios?", next: "n3" },
        { text: "Nada más 😉", next: "fin", end: true },
      ],
    },
    fin: {
      id: "fin",
      type: "fin",
      messages: ["¡Genial! Aquí estaré por si me necesitas de nuevo 😉"],
      options: [{ text: "Seguir jugando", next: "fin", end: true }],
    },
  },
  start: "n0",
};

export default function ModalChat({ data, onClose }) {
  const [messages, setMessages] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [options, setOptions] = useState([]);
  const chatEndRef = useRef(null);
  const idCounter = useRef(1);
  const activatedRef = useRef(false);
  const autoOpenRef = useRef(data?.autoOpen === true);
  const { sessionId } = useSession();
  const { chatActivated, chatScrollTrigger } = useCardModal();

  const nextId = () => idCounter.current++;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (autoOpenRef.current) {
      loadNode("n0");
    } else {
      loadNode("n1");
    }
  }, []);

  useEffect(() => {
    if (chatScrollTrigger > 0) scrollToBottom();
  }, [chatScrollTrigger]);

  useEffect(() => {
    if (chatActivated && !activatedRef.current) {
      activatedRef.current = true;
      setCurrentNode(chatFlow.nodes.n1);
      setOptions(chatFlow.nodes.n1.options);
      scrollToBottom();
    }
  }, [chatActivated]);

  const addBotMessages = (nodeMessages, callback) => {
    nodeMessages.forEach((text, i) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: nextId(), text, isBot: true }]);
        if (i === nodeMessages.length - 1 && callback) callback();
      }, i * 600);
    });
  };

  const loadNode = (nodeId) => {
    const node = chatFlow.nodes[nodeId];
    if (!node) return;

    setOptions([]);
    setCurrentNode(node);

    addBotMessages(node.messages, () => {
      if (node.next) {
        setTimeout(() => loadNode(node.next), 400);
      } else if (node.options) {
        setOptions(node.options);
      }
    });
  };

  const handleOption = (option) => {
    trackEvent("chat_opcion_click", {
      session_id: sessionId || undefined,
      nodo_origen: currentNode?.id || "unknown",
      nodo_destino: option.next,
      opcion_texto: option.text,
      es_fin: Boolean(option.end),
    });

    setMessages((prev) => [
      ...prev,
      { id: nextId(), text: option.text, isBot: false },
    ]);
    setOptions([]);

    setTimeout(() => {
      loadNode(option.next);
    }, 300);
  };

  return (
    <div className={styles.modalChat}>
      <div className={styles.chatContainer}>
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.isBot
                  ? styles.messageWrapper
                  : styles.userMessageWrapper
              }
            >
              {message.isBot ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
                    className={styles.avatar}
                  >
                    <img
                      src="/icons/ico-input-chat.svg"
                      alt="Avatar bot"
                    />
                  </motion.div>
                  <MessageBasic message={message.text} />
                </>
              ) : (
                <div className={styles.userChoice}>
                  <BntBasic text={message.text} />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </>

        {options.length > 0 && (
          <div className={styles.optionsContainer}>
            {options.map((option, index) => (
              <div
                key={index}
                className={styles.choiceBtn}
                onClick={() => {
                  handleOption(option);
                  if (option.next === "fin") {
                    onClose();
                  }
                }}
              >
                {option.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
