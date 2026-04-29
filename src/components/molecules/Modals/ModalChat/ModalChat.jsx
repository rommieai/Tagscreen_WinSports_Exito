import React, { useState, useEffect, useRef } from "react";
import styles from "./style.module.css";
import MessageBasic from "../../../MessageBasic/MessageBasic";
import BntBasic from "../../../atoms/btnBasic/btnBasic";
import { motion } from "framer-motion";
import { useSession } from "../../../../context/Session/SessionContext";
import { trackEvent } from "../../../../lib/firebaseAnalytics";
import { useCardModal } from "../../../../context/CardModal/CardModalContext";

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
  const { chatActivated, chatScrollTrigger } = useCardModal();

  const nextId = () => idCounter.current++;

  const scrollTargetIdRef = useRef(null);

  useEffect(() => {
    if (!scrollTargetIdRef.current) return;
    const target = chatContainerRef.current?.querySelector(
      `[data-msg-id="${scrollTargetIdRef.current}"]`
    );
    if (target) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top,
        behavior: "smooth",
      });
      scrollTargetIdRef.current = null;
    }
  }, [messages]);

  useEffect(() => {
    if (autoOpenRef.current) {
      loadNode("n0");
    } else {
      loadNode("n1");
    }
  }, []);

  

  useEffect(() => {
    if (chatActivated && !activatedRef.current) {
      activatedRef.current = true;
      loadNode("n1");
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
      <div className={styles.chatContainer} ref={chatContainerRef}>
        <>
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
