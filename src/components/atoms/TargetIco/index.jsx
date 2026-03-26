import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import style from "./style.module.css";
import { useTarget } from "../../../context/TargetContext";

export default function Target({ tvDetected, audioState }) {
  const { targetState } = useTarget();
  const IconoSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="230"
      height="230"
      viewBox="0 0 230 230"
      fill="none"
    >
      <path
        d="M226.505 91.1695V29.126C226.505 14.9927 215.007 3.49902 200.878 3.49902H138.838C138.159 1.46605 136.241 0 133.981 0H96.0262C93.7658 0 91.8483 1.46605 91.1695 3.49902H29.126C14.9963 3.49902 3.49902 14.9963 3.49902 29.126V91.1659C1.46605 91.8447 0 93.7622 0 96.0226V133.977C0 136.238 1.46605 138.155 3.49902 138.834V200.874C3.49902 215.004 14.9963 226.501 29.126 226.501H91.1659C91.8447 228.534 93.7622 230 96.0226 230H133.977C136.238 230 138.155 228.534 138.834 226.501H200.874C215.007 226.501 226.501 215.004 226.501 200.874V138.834C228.534 138.155 230 136.238 230 133.977V96.0226C230 93.7622 228.534 91.8447 226.501 91.1659L226.505 91.1695ZM200.878 223.255H138.838C138.159 221.222 136.241 219.756 133.981 219.756H96.0262C93.7658 219.756 91.8483 221.222 91.1695 223.255H29.126C16.7873 223.255 6.74888 213.216 6.74888 200.878V138.838C8.78185 138.159 10.2479 136.241 10.2479 133.981V96.0262C10.2479 93.7658 8.78185 91.8483 6.74888 91.1695V29.126C6.74888 16.7873 16.7873 6.74888 29.126 6.74888H91.1659C91.8447 8.78185 93.7622 10.2479 96.0226 10.2479H133.977C136.238 10.2479 138.155 8.78185 138.834 6.74888H200.874C213.213 6.74888 223.251 16.7873 223.251 29.126V91.1659C221.218 91.8447 219.752 93.7622 219.752 96.0226V133.977C219.752 136.238 221.218 138.155 223.251 138.834V200.874C223.251 213.213 213.213 223.251 200.874 223.251L200.878 223.255Z"
        fill="white"
      />
    </svg>
  );

  useEffect(() => {
    if (!targetState) return;
  }, [targetState, audioState]);

  return (
    <div className={`${style.target}`}>
      {!targetState && (
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
            delay: 1,
            type: "spring",
            stiffness: 180,
            damping: 12,
          }}
        >
          {IconoSvg}

          {!tvDetected && (
            <h2 className={style.title}>
              {audioState === false
                ? "Sube el volumen o acércate a la TV"
                : "¡Apunta \n a la pantalla!"}
            </h2>
          )}
        </motion.div>
      )}
    </div>
  );
}
