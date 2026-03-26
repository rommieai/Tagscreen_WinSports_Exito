import { Link } from "react-router";
import styles from "./styles.module.css";

export default function BntBasic({ text, link, onClick }) {
  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btn_basic}
        onClick={onClick}
      >
        {text}
      </a>
    );
  }
  return <div className={styles.btn_basic}>{text}</div>;
}
