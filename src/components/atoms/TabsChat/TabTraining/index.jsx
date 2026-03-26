import React, { useState, useEffect } from "react";
import styles from "./style.module.css";

// SVG Placeholder Component (Se mantiene igual)
const ShirtIcon = ( { colorJersey } ) => (

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="8"
    viewBox="0 0 6 8"
    fill="none"
  >
    <path
      d="M4.07122 0V0.155859C4.07122 0.782277 3.56159 1.2919 2.93517 1.2919C2.30875 1.2919 1.79912 0.782277 1.79912 0.155859V0L0 0.674674L0.72472 3.09043C0.730725 3.11046 0.733793 3.13127 0.733793 3.1522V7.06383C0.733793 7.18255 0.830045 7.27881 0.948771 7.27881H4.92157C5.04029 7.27881 5.13655 7.18255 5.13655 7.06383V3.1522C5.13655 3.13127 5.1396 3.11046 5.14562 3.09043L5.87034 0.674674L4.07122 0ZM4.53174 2.57365C4.53174 3.03849 4.01168 3.31194 3.95238 3.34159C3.92215 3.3567 3.8892 3.36428 3.85624 3.36428C3.82327 3.36428 3.79031 3.3567 3.7601 3.34159C3.70079 3.31194 3.18073 3.03849 3.18073 2.57365V2.22825C3.18073 2.10952 3.27699 2.01327 3.39571 2.01327H4.31676C4.43549 2.01327 4.53174 2.10952 4.53174 2.22825V2.57365Z"
      fill={colorJersey }
    />
  </svg>
);

export default function TabTraining({ initialData }) {

  if (!initialData?.equipos) return null;
  
  const lineups = initialData.lineups;
  const colorLocal = initialData.equipos.local.colores.primary;
  const colorVisit = initialData.equipos.visitante.colores.secondary;

  const localLineUps = lineups[0];
  const visitLineUps = lineups[1];

  const mapTeamData = (data) => ({
    country: data.team_name.toUpperCase(),
    manager: data.coach_name,
    formation: data.formation,
    players: data.startXI.map((player) => player.name),
  });

  const teamLeft = mapTeamData(localLineUps);
  const teamRight = mapTeamData(visitLineUps);

  return (
    <div className={styles.card}>
      <div className={styles.contentContainer}>
        <div className={`${styles.column} ${styles.leftColumn}`}>
          <h2 className={styles.countryName}>{teamLeft.country}</h2>

          <div className={styles.metaRow}>
            <div className={styles.dtBox}>
              <span className={styles.label}>DT:</span>{" "}
              {teamLeft.manager.split(" ").slice(0, 2).join(" ")}
            </div>
            <div className={styles.formationBox}>{teamLeft.formation}</div>
          </div>

          <ul className={styles.playerList}>
            {teamLeft.players.map((player, index) => (
              <li key={index} className={styles.playerItem}>
                <ShirtIcon colorJersey={colorLocal} />
                <span className={styles.playerName}>
                  {player.split(" ").slice(0, 2).join(" ")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.divider}></div>

        <div className={`${styles.column} ${styles.rightColumn}`}>
          <h2 className={styles.countryName}>{teamRight.country}</h2>

          <div className={styles.metaRow}>
            <div className={styles.formationBox}>{teamRight.formation}</div>
            <div className={styles.dtBox}>
              <span className={styles.label}>DT:</span>
              {teamRight.manager.split(" ").slice(0, 2).join(" ")}
            </div>
          </div>

          <ul className={styles.playerList}>
            {teamRight.players.map((player, index) => (
              <li key={index} className={styles.playerItem}>
                <span className={styles.playerName}>{player}</span>
                <ShirtIcon colorJersey={colorVisit} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
