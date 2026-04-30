import React, { useState, useEffect, useRef } from "react";
import styles from "./style.module.css";
import MessageBasic from "../../../MessageBasic/MessageBasic";
import BntBasic from "../../../atoms/btnBasic/btnBasic";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "../../../../context/Session/SessionContext";
import { trackEvent } from "../../../../lib/firebaseAnalytics";
import { useCardModal } from "../../../../context/CardModal/CardModalContext";
import ContentChat from "../../MainDataChat/ContentChat";

import chatFlow from "./data.json";

export default function ModalChat({ data, onClose }) {
  const [messages, setMessages] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [options, setOptions] = useState([]);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const idCounter = useRef(1);
  const activatedRef = useRef(false);
  const autoOpenRef = useRef(data?.autoOpen === true);
  const { sessionId } = useSession();
  const { chatActivated, chatSelectedOption, chatScrollTrigger } = useCardModal();

  const nextId = () => idCounter.current++;
  const scrollTargetIdRef = useRef(null);

  useEffect(() => {
    if (!scrollTargetIdRef.current || options.length === 0) return;
    const target = chatContainerRef.current?.querySelector(
      `[data-msg-id="${scrollTargetIdRef.current}"]`
    );
    if (target) {
      chatContainerRef.current.scrollTo({ top: target.offsetTop, behavior: "smooth" });
      scrollTargetIdRef.current = null;
    }
  }, [options]);

  useEffect(() => {
    if (autoOpenRef.current) {
      loadNode("n0");
    }
  }, []);

  useEffect(() => {
    if (chatActivated && !activatedRef.current) {
      activatedRef.current = true;
      if (chatSelectedOption) {
        setMessages([{ id: nextId(), text: chatSelectedOption.text, isBot: false }]);
        setTimeout(() => loadNode(chatSelectedOption.next), 300);
      } else if (!autoOpenRef.current) {
        loadNode("n1");
      }
    }
  }, [chatActivated, chatSelectedOption]);

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
      } else if (node.type === "fin") {
        setTimeout(() => onClose(), 1000);
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
    scrollTargetIdRef.current = idCounter.current;
    setOptions([]);

    setTimeout(() => {
      loadNode(option.next);
    }, 300);
  };

  return (
    <div className={styles.modalChat}>
      <AnimatePresence>
        {!chatActivated && (
          <motion.div
            key="content"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ContentChat />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatActivated && (
          <motion.div
            key="chat"
            className={styles.chatContainer}
            ref={chatContainerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                data-msg-id={message.isBot ? message.id : undefined}
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
                      <img src="/icons/ico-input-chat.svg" alt="Avatar bot" />
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

            {options.length > 0 && (
              <div className={styles.optionsContainer}>
                {options.map((option, index) => (
                  <div
                    key={index}
                    className={styles.choiceBtn}
                    onClick={() => handleOption(option)}
                  >
                    {option.text}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
