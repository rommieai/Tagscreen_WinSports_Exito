import { useEffect, useState } from "react";
import style from "./styles.module.css";

export default function TabInformation({ initialData }) {
  const [stateMatch, setStateMatch] = useState(null); 
  const [dataLocal, setDataLocal] = useState(null);
  const [dataVisit, setDataVisit] = useState(null);

  useEffect(() => {
    const translations = {
      "First Half": "Primer tiempo",
      "Second Half": "Segundo tiempo",
      "Not Started": "No ha iniciado",
      "Match Finished": "Partido terminado",
      "Match Fished": "Partido terminado",
      "Half Time": "Medio tiempo",
    };

    setStateMatch(
      initialData?.estado
        ? translations[initialData?.estado] ?? initialData?.estado
        : null
    );
    setDataLocal(initialData?.equipos?.local);
    setDataVisit(initialData?.equipos?.visitante);
  }, [initialData]);

  return (
    <div className={style.tabInformation}>
      <div className={style.headerCard}>
        <h4>Información General</h4>
      </div>
      <div className={style.bodyCard}>
        <div className={style.shield}>
          <div className={style.itemShield}>
            <img
              src={dataLocal?.logo}
              alt={`Logo ${dataLocal?.nombre}`}
            />
          </div>
          <div className={style.itemShield}>
            <span>VS</span>
          </div>
          <div className={style.itemShield}>
            <img
              src={dataVisit?.logo}
              alt={`Logo ${dataVisit?.nombre}`}
            />
          </div>
        </div>
        <div className={style.relevantData}>
          <h4>{initialData?.liga && "Liga"}</h4>
          <h4>Emirates Stadium</h4>
          <h5>{stateMatch}</h5>
        </div>
        <div className={style.vsInfo}>
          <div className={`${style.itemData} ${style.itemTriumphs}`}>
            <span className={style.valueLocal}>{dataLocal?.estadisticas_temporada?.ganados}</span>
            <span className={style.text}>Triunfos</span>
            <span className={style.valueVisitor}>{dataVisit?.estadisticas_temporada?.ganados}</span>
          </div>
          <div className={`${style.itemData} ${style.itemDraw}`}>
            <span className={style.valueLocal}>{dataLocal?.estadisticas_temporada?.empatados}</span>
            <span className={style.text}>Empates</span>
            <span className={style.valueVisitor}>{dataVisit?.estadisticas_temporada?.empatados}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
