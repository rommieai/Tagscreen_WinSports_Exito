import styles from "./styles.module.css";

export default function PlayerCard() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        JUGADOR
        <br />
        <span className={styles.brand}>POWERADE</span>
      </h3>

      <div className={styles.infoBox}>
        <p>
          <span className={styles.label}>EDAD:</span> 26 AÑOS
        </p>
        <p>
          <span className={styles.label}>GOLES OFICIALES:</span> 385
        </p>
        <p>
          <span className={styles.label}>CLUB ACTUAL:</span>{" "}
          <span className={styles.club}>REAL MADRID F.C.</span>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
            alt="Real Madrid Logo"
            className={styles.logo}
          />
        </p>
      </div>

      <div className={styles.socials}></div>
    </div>
  );
}
