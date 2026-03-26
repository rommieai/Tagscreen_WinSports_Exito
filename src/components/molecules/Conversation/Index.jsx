import React, { useState, useEffect } from "react";
import { useActiveComponents } from "../../../context/ActiveChatContext";
import { motion } from "framer-motion";
import styles from "./styles.module.css";
import LoadingDots from "./LoadingDots";

/* // TODO //
  - Animaciones
  - Mostrar cargando del componente
  - Mensaje por si no encuentra una respuesta
*/

const LOG_API_URL = "https://api-logs-errors.kontent-dev.com/api/log-fetch";

const sendLogSafe = (payload) => {
  fetch(LOG_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Si el log falla, la aplicación principal de chat no se ve afectada
  });
};

const Conversation = ({ question }) => {
  const [messages, setMessages] = useState([]);
  const [lastQuestion, setLastQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const { killChat, setKillChat } = useActiveComponents();

  useEffect(() => {
    if (killChat) {
      setMessages([]);
      setKillChat(false);
      return;
    }
    const trimmed = question?.trim();
    if (!trimmed || trimmed === lastQuestion) return;

    setLastQuestion(trimmed);

    const newQuestion = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };
    setMessages((prev) => {
      if (prev.some((msg) => msg.text === trimmed && msg.sender === "user"))
        return prev;
      return [...prev, newQuestion];
    });

    setLoading(true);

    // ⏱️ 1. Marca de tiempo inicial
    const startTime = Date.now();

    fetch(
      `http://64.225.61.91:8006/football/ask/${import.meta.env.VITE_MATCH_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmed }),
      }
    )
      .then((res) => {
        // ⏱️ 2. Tiempo transcurrido hasta recibir headers
        const timeToResponse = Date.now() - startTime;

        // 📝 3. Enviamos un log si la respuesta de red falla (opcional)
        if (!res.ok) {
          sendLogSafe({
            status: res.status,
            responseTime: timeToResponse,
            isOk: false,
            data: `ERROR_CHAT: Pregunta: "${trimmed}"`,
          });
        }

        return res.json();
      })
      .then((data) => {
        console.log("Respuesta del backend:", data);

        // ⏱️ 4. Tiempo total transcurrido (hasta procesar JSON)
        const totalTime = Date.now() - startTime;

        if (data?.answer) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: "bot",
              text: data.answer,
            },
          ]);

          /* 📝 5. Enviamos log de éxito
          sendLogSafe({
            status: 200, // Asumimos 200 si llega hasta aquí
            responseTime: totalTime,
            isOk: true,
            // Concatenamos pregunta y respuesta para el log
            data: `CHAT_SUCCESS: Q: "${trimmed}" | A: "${data.answer.substring(
              0,
              100
            )}..."`,
          });*/
        } else {
          /* 📝 6. Enviamos log de respuesta vacía 
          sendLogSafe({
            status: 200,
            responseTime: totalTime,
            isOk: true,
            data: `CHAT_NO_ANSWER: Pregunta: "${trimmed}"`,
          });*/
        }

        setLoading(false);
      })
      .catch((err) => {
        // ⏱️ 7. Tiempo en caso de error
        const timeOnError = Date.now() - startTime;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            sender: "bot",
            text: "Lo siento, hubo un error al obtener la respuesta.",
          },
        ]);

        // 📝 8. Enviamos log de error de red o parsing
        sendLogSafe({
          status: "NETWORK_FAIL",
          responseTime: timeOnError,
          isOk: false,
          data: `CHAT_CATCH_ERROR: Pregunta: "${trimmed}" | Error: ${err.message}`,
        });

        setLoading(false);
      });
  }, [question, lastQuestion, killChat, setKillChat]);

  // ... (El resto del componente no cambia)
  const messagesRef = React.useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages} ref={messagesRef}>
        {messages.map((msg) => {
          let cleanText = msg.text.replace(/`/g, "");
          cleanText = cleanText.replace(/html/gi, "");
          cleanText = cleanText.replace(
            /<\s*lang\s*=\s*["']?es["']?\s*>/gi,
            ""
          );
          return (
            <motion.div
              key={msg.id}
              initial={{
                x: msg.sender === "bot" ? -50 : 50,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={`${styles.message} ${
                msg.sender === "user" ? styles.user : styles.bot
              }`}
              dangerouslySetInnerHTML={{ __html: cleanText }}
            />
          );
        })}
        {loading && (
          <div className={styles.message + " " + styles.bot}>
            <LoadingDots />
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversation;
