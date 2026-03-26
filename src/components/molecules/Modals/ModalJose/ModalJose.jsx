import { useEffect, useMemo, useState } from "react";
import style from "./style.module.css";
import SliderProducts from "../../../atoms/SliderProducts/SliderProducts";
import MessageBasic from "../../../MessageBasic/MessageBasic";
import BntBasic from "../../../atoms/btnBasic/btnBasic";
import TitleCard from "../../../atoms/TitleCard/TitleCard";
import Timer from "../../../atoms/Timer/Timer";
import CHARACTERS_DATA from "./charactersData";


export default function NModalJose({ data, onClose }) {
  const [optionSelected, setOptionSelected] = useState(null);

  const character = CHARACTERS_DATA.find((c) => c.personId === data);

  if (!character) {
    return (
      <div className={style.modalBrand}>
        <MessageBasic message="Personaje no encontrado" />
        <button onClick={onClose}>Cerrar</button>
      </div>
    );
  }

  const { name, avatar, mainText, conversation, timer, products } = character;

  const btnOptions = conversation.map((item) => ({
    id: item.id,
    text: item.mainChoice || item.id,
  }));

  const selectedReply = conversation.find((item) => item.id === optionSelected);

  // Evita cambiar entre rerenders useMemo
  const displayMessage = useMemo(() => {
    if (!selectedReply) return "";

    if (Array.isArray(selectedReply.message)) {
      const randomIndex = Math.floor(Math.random() * selectedReply.message.length);
      return selectedReply.message[randomIndex];
    }

    return selectedReply.message || "...";
  }, [selectedReply]);

  return (
    <>
      <div className={style.logoCard}>
        <img src={avatar} alt={name} />
      </div>

      <div className={style.modalBrand}>
        {!optionSelected ? (
          <div className={style.mainContent}>
            <div className={style.character}>
              <TitleCard text={name} />
            </div>

            <MessageBasic message={mainText} />

            <div className={style.optionsContainer}>
              {btnOptions.map((option) => (
                <div
                  key={option.id}
                  className={style.choiceBtn}
                  onClick={() => setOptionSelected(option.id)}
                >
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={style.secondaryContent}>
            <div className={style.answerContainer}>
              <div className={style.choiceUser}>
                <BntBasic text={selectedReply?.mainChoice || selectedReply?.id || "—"} />
              </div>

              <MessageBasic message={displayMessage} />
              { products && selectedReply?.id != "aun_no" && (<SliderProducts productos={products} />) }
              { timer && <Timer /> }
            </div>
          </div>
        )}
      </div>
    </>
  );
}