import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import style from "./style.module.css";

export default function MessageBasic({ message, isStream }) {
  const [displayedMessage, setDisplayedMessage] = useState("");

  useEffect(() => {
    setDisplayedMessage(message);
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={style.messageBasic}
    >
      <p>{displayedMessage}</p>
    </motion.div>
  );
}
