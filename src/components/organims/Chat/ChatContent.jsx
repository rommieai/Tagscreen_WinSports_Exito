import React, { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import style from "./style.module.css";
import Message from "./Message";
import CtaBasic from "../../atoms/CtaBasic/CtaBasic";
import Slider from "./Slider";

const ChatContent = ({
  conversationFlow,
  onSpecialOption,
  image,
  sliderAvatar,
}) => {
  const [conversacion, setConversation] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState("start");

  const containerRef = useRef(null);

  const scrollToBottom = (nextId) => {
    if (containerRef.current) {
      setTimeout(() => {
        if (nextId === "q_que_hacer_ahora") {
          containerRef.current.scrollTo({
            top: 280,
          });
        } else {
          const maxScroll =
            containerRef.current.scrollHeight -
            containerRef.current.clientHeight;
          containerRef.current.scrollTo({
            top: maxScroll,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  const handleOption = (option) => {
    const currentQ = conversationFlow[currentQuestionId];

    setConversation((prevConversation) => [
      ...prevConversation,
      {
        pregunta: currentQ.question,
        answer: option.text,
      },
    ]);

    let nextId = option.next;

    if (!nextId) {
      setCurrentQuestionId(null);
      scrollToBottom(nextId);

      if (onSpecialOption) onSpecialOption(option.text);
      return;
    }

    let nextStep = conversationFlow[nextId];

    const newConversation = [];

    while (nextStep && nextStep.type === "response") {
      newConversation.push({
        pregunta: nextStep.question,
        link: nextStep.link,
        image_link: nextStep.image_link,
        answer: null,
      });

      nextId = nextStep.next;
      nextStep = conversationFlow[nextId];
    }

    if (newConversation.length > 0) {
      setConversation((prev) => [...prev, ...newConversation]);
    }

    setCurrentQuestionId(nextId);

    scrollToBottom(nextId);

    if (onSpecialOption) onSpecialOption(option.text);
  };

  const printQuestion = () => {
    if (!currentQuestionId) return null;

    const question = conversationFlow[currentQuestionId];
    if (!question) return null;

    const botMessage = (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
          delay: 0.1,
        }}
      >
        <Message
          key={`bot_message_${currentQuestionId}`}
          question={question.question}
          style_message={"bot"}
        />
      </motion.div>
    );

    if (question.type === "multi_answer") {
      return (
        <>
          {botMessage}
          <motion.div
            className={style.options_container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: 0.3,
            }}
          >
            {question.options.map((opcion, indice) => (
              <motion.button
                type="button"
                key={`question_item_${currentQuestionId}_${indice}`}
                className={style.option_answer}
                onClick={() => handleOption(opcion)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.4 + indice * 0.1,
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { duration: 0.1 },
                }}
              >
                {opcion.text}
              </motion.button>
            ))}
          </motion.div>
        </>
      );
    }

    if (question.type === "gif") {
      return (
        <>
          {botMessage}
          <motion.div
            className={style.options_container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: 0.3,
            }}
          >
            <a className={style.btn_chat} target="_blank" href={question.link}>
              Reclámalo aquí
            </a>
          </motion.div>
        </>
      );
    }
    return botMessage;
  };

  return (
    <div className={style.content_chat_xavy}>
      {image && (
        <div className={style.images_chat}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="52"
            height="52"
            viewBox="0 0 52 52"
            fill="none"
          >
            <circle
              cx="26"
              cy="26"
              r="24.5"
              stroke="url(#paint0_linear_913_70)"
              strokeWidth="3"
            />
            <defs>
              <linearGradient
                id="paint0_linear_913_70"
                x1="42.3091"
                y1="44.739"
                x2="9.29938"
                y2="7.63565"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#F200FF" />
                <stop offset="0.5" stopColor="#F5D8FC" />
                <stop offset="1" stopColor="#A357FA" />
              </linearGradient>
            </defs>
          </svg>
          {sliderAvatar ? (
            <Slider images={sliderAvatar} interval={5000} />
          ) : (
            image && (
              <img src={image} alt="Avatar" className={style.avatar_img} />
            )
          )}
        </div>
      )}
      <div
        className={`${style.chat_container} chat_container`}
        ref={containerRef}
      >
        <AnimatePresence>
          {conversacion.map((mensaje, indice) => (
            <React.Fragment key={`conv_pair_${indice}`}>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                  delay: 0.1,
                }}
              >
                <Message question={mensaje.pregunta} style_message={"bot"} />
                {mensaje.link && (
                  <a
                    href={mensaje.link}
                    target="_blank"
                    className={style.link_out}
                  >
                    {mensaje.image_link ? (
                      <img src={mensaje.image_link} alt="Cart image" />
                    ) : (
                      <p>Link</p>
                    )}
                  </a>
                )}
              </motion.div>
              {mensaje.answer != null && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: 0.2,
                  }}
                >
                  <Message question={mensaje.answer} style_message={"user"} />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>
        <AnimatePresence>{printQuestion()}</AnimatePresence>
      </div>
    </div>
  );
};

export default ChatContent;
