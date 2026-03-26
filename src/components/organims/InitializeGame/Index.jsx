import style from "./style.module.css";

export default function InitializeGame({ printTvScan, errorSeries }) {
  return (
    <>
      <div className={style.get_serie}>
        {printTvScan && <h2>¡Apunta a la pantalla!</h2>}
      </div>
    </>
  );
}
