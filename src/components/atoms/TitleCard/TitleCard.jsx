import styles from "./style.module.css";

export default function TitleCard({ text }) {
  return (
    <div className={styles.titleCard}>{text}</div>
  );
}