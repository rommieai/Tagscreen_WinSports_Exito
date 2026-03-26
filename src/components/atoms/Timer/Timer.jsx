import { useEffect, useRef, useState } from "react";
import styles from "./style.module.css";

export default function Timer() {
  const [time, setTime] = useState(300);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setTime((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const format = (num) => num.toString().padStart(2, "0");

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.timeDisplay}>
          <span className={styles.mainTime}>
            {format(hours)}:{format(minutes)}:{format(seconds)}
          </span>
        </div>
        <div className={styles.labels}>
          <span>HORAS</span>
          <span>MINUTOS</span>
          <span>SEGUNDOS</span>
        </div>
      </div>
    </div>
  );
}
