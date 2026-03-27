import { Link } from "react-router";
import styles from "./styles.module.css";

export default function BntBasic({ text, link, onClick }) {

    return (
      <Link
        to={link}
        className={styles.btnBasic}
        onClick={onClick}
      >
        {text}
      </Link>
    );
}
