import style from "./style.module.css";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
// Componente de cargando tipo "escribiendo"
const TypingLoader = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      height: "32px",
    }}
  >
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#999",
        }}
        animate={{
          y: [0, -8, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

export default function Message({ question, style_message }) {
  // Si question es un array, renderizar múltiples mensajes
  // Loader solo para el caso de string (respuesta bot)
  const [isLoading, setIsLoading] = useState(style_message === "bot");
  useEffect(() => {
    if (style_message === "bot") {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [question, style_message]);
  if (Array.isArray(question)) {
    return (
      <>
        {question.map((msg, index) => (
          <div
            key={index}
            className={`${style.message_container} ${
              style_message === style.bot ? style.message_div : null
            } `}
          >
            {style_message === "link_post" ? (
              <div className={style.post_message}>
                <a href={`#`} target="_blank">
                  <div className={style.image_post}>
                    <img
                      fill
                      src={
                        "https://dev-back-virtual-creators.kontent-dev.com/sites/default/files/2024-08/ai-powered-new-virtual-creators.webp"
                      }
                      alt="New Virtual Creators to Skyrocket Brands Potential"
                    />
                  </div>
                  <h3 className={style.title_post}>{msg}</h3>
                </a>
              </div>
            ) : (
              <div
                className={`${style.message_item} ${
                  style_message === "bot"
                    ? style.content_bot
                    : style.content_user
                } `}
              >
                <label className={`${style.label_user} label_user`}>
                  {style_message === "bot" ? "Xavy" : "You"}
                </label>
                <div
                  className={`${style.message_chat} ${
                    style_message === "bot"
                      ? style.message_xavy
                      : style.message_user
                  } `}
                  dangerouslySetInnerHTML={{ __html: msg }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </>
    );
  }

  // Si question es un string, mostrar loader antes del mensaje
  if (!Array.isArray(question)) {
    return (
      <div
        className={`${style.message_container} ${
          style_message === style.bot ? style.message_div : null
        } `}
      >
        {isLoading ? (
          <TypingLoader />
        ) : style_message === "link_post" ? (
          <div className={style.post_message}>
            <a href={`#`} target="_blank">
              <div className={style.image_post}>
                <img
                  fill
                  src={
                    "https://dev-back-virtual-creators.kontent-dev.com/sites/default/files/2024-08/ai-powered-new-virtual-creators.webp"
                  }
                  alt="New Virtual Creators to Skyrocket Brands Potential"
                />
              </div>
              <h3 className={style.title_post}>{question}</h3>
            </a>
          </div>
        ) : (
          <div
            className={`${style.message_item} ${
              style_message === "bot" ? style.content_bot : style.content_user
            } `}
          >
            <label className={`${style.label_user} label_user`}>
              {style_message === "bot" ? "Xavy" : "You"}
            </label>
            <div
              className={`${style.message_chat} ${
                style_message === "bot"
                  ? style.message_xavy
                  : style.message_user
              } `}
            >
              <p>{question}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}
