import React from 'react';
import styles from "./styles.module.css";

const STAT_CONFIG = [
  { key: 'partidos_jugados', label: 'Jugados' },
  { key: 'ganados', label: 'Ganados' },
  { key: 'empatados', label: 'Empatados' },
  { key: 'perdidos', label: 'Perdidos' },
  { key: 'goles_favor', label: 'Goles a favor' },
  { key: 'goles_contra', label: 'Goles en contra' },
];

const formatTeamName = (name) => {
  return name ? name.toUpperCase().trim().substring(0, 3) : '---';
};

export default function TabStatistics({ initialData }) {
  if (!initialData?.equipos) return null;

  const localStats = initialData.equipos.local.estadisticas_temporada; 
  const visitStats = initialData.equipos.visitante.estadisticas_temporada;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.teamBox}>{formatTeamName(initialData.equipos.local.nombre)}</div>
        <div className={styles.titleBox}>Partidos</div>
        <div className={styles.teamBox}>{formatTeamName(initialData.equipos.visitante.nombre)}</div>
      </div>

      <div className={styles.statsContainer}>
        {STAT_CONFIG.map((stat) => (
          <div key={stat.key} className={styles.column}>
            
            <div className={styles.statRow}>
              <span className={styles.number}>
                {localStats[stat.key] ?? 0}
              </span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.label}>{stat.label}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.number}>
                {visitStats[stat.key] ?? 0}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}