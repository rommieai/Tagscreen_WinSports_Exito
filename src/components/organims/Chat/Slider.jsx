import React, { useEffect, useState } from "react";
import style from "./style.module.css";

const Slider = ({ images = [], interval = 3000 }) => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (images.length === 0) return;
    setFade(true);
    const timer = setInterval(() => {
      if (current < images.length - 1) {
        setFade(false);
        setTimeout(() => {
          setCurrent((prev) => prev + 1);
          setFade(true);
        }, 300); // Duración del fade-out
      } else {
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [images, interval, current]);

  if (!images.length) return null;

  return (
    <div className={style.slider_avatar_container}>
      <img
        src={images[current]}
        alt={`slider-avatar-${current}`}
        className={
          style.slider_avatar_img +
          " " +
          (fade ? style["fade-in"] : style["fade-out"])
        }
      />
    </div>
  );
};

export default Slider;
