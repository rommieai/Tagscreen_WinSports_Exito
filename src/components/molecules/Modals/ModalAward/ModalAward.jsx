import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./styles.module.css";
import AwardItem from "./AwardItem";

const DUMMY_SLIDES = [
  {
    id: 1,
    image: "https://www.andina.com.co/sites/default/files/sixpack_0.png",
    title: "Six Pack Andina",
  },
  {
    id: 2,
    image: "https://www.andina.com.co/sites/default/files/sixpack_0.png",
    title: "Camiseta WinSports",
  },
  {
    id: 3,
    image: "https://www.andina.com.co/sites/default/files/sixpack_0.png",
    title: "Pack Combo Fan",
  },
];

const currentAwwards = false;

const DISABLED_SLIDES = Array.from({ length: 4 }).map((_, index) => ({
  id: `disabled-${index}`,
  image: "public/images/products/disabled-product-1.png",
  title: "Premio Bloqueado",
  locked: true,
}));

export default function ModalAward({ data, onClose }) {
  const activeSlides = data?.items ?? DUMMY_SLIDES;
  const slides = currentAwwards ? activeSlides : DISABLED_SLIDES;

  return (
    <div className={styles.awardWrapper}>
      <h2 className={styles.headerTitle}>{currentAwwards ? "Escanea y reclama descuentos" : "¡Tus Descuentos!"}</h2>

      {/* Swiper */}
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        className={styles.swiper}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className={styles.slide}>
            <AwardItem item={slide} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
