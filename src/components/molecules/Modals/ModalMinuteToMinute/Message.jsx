import styles from "./styles.module.css";

export default function Message({ minute, text }) {
  return (
    <div className={styles.messageBurble}>
      <p>Min {minute}:00'</p>
      <p>{text}</p>
    </div>
  );
}