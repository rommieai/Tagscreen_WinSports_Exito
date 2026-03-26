import { useMemo } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import styles from "./style.module.css";

export default function SliderProducts({ productos }) {
  const productosPrint = useMemo(() => {
    console.log("productos", productos);
    if (!productos || productos.length === 0) return [];
    return [...productos].sort(() => Math.random() - 0.5);
  }, []);

  if (productosPrint.length === 0) return null;

  return (
    <div className={styles.sliderContainer}>
      <Swiper
        className={styles.mySwiper}
        modules={[Autoplay]}
        slidesPerView={3}
        spaceBetween={7}
        loop={true}
        grabCursor={true}
        breakpoints={{
          320: { slidesPerView: 3 },
        }}
      >
        {productosPrint.map((item, idx) => (
          <SwiperSlide key={idx} className={styles.productSlideWrapper}>
            <div
              className={styles.productSlide}
              style={{
                backgroundImage: `url(${item.img})`,
              }}
            >
              <div className={styles.productContent}>
                <p className={styles.productTitle}>
                  {item.product}
                  <br />
                  <strong>{item.brand}</strong>
                </p>
                <a
                  className={styles.buyButton}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Comprar
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
