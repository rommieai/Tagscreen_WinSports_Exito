import React from "react";
import styles from "./styles.module.css";

const LoadingDots = () => (
  <div className={styles.loadingDots}>
    <span className={styles.dot}></span>
    <span className={styles.dot}></span>
    <span className={styles.dot}></span>
  </div>
);

export default LoadingDots;
