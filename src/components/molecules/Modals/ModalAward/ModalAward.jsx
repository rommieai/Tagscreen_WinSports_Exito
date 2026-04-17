import React, { useState, useEffect } from "react";
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

const DISABLED_SLIDES = Array.from({ length: 4 }).map((_, index) => ({
  id: `disabled-${index}`,
  image: "/images/products/disabled-product-1.png",
  title: "Premio Bloqueado",
  locked: true,
}));

export default function ModalAward({ data, onClose }) {
  const [currentAwwards, setCurrentAwards] = useState(false);
  const [productsArray, setProductsArray] = useState([]);

  useEffect(() => {
    try {
      const productStr = localStorage.getItem("product");
      if (productStr) {
        const productData = JSON.parse(productStr);
        // validate if it's a valid object with at least one parameter
        if (productData && typeof productData === "object" && Object.keys(productData).length > 0) {
          if (productData.products && Array.isArray(productData.products) && productData.products.length > 0) {
            setCurrentAwards(true);
            setProductsArray(productData.products);
          }
        }
      }
    } catch (e) {
      console.error("Error reading product from localStorage in ModalAward:", e);
    }
  }, []);

  const activeSlides = productsArray.length > 0
    ? productsArray.map((prod, i) => ({
        id: `prod-${i}`,
        image: prod === 'product_1' ? '/images/products/product-andina.png' : '/images/products/product-adidas.png',
        title: prod === 'product_1' ? 'Producto Andina' : 'Producto Adidas'
    }))
    : data?.items ?? DUMMY_SLIDES;

  const slides = currentAwwards ? activeSlides : DISABLED_SLIDES;

  return (
    <div className={styles.awardWrapper}>
      <h2 className={styles.headerTitle}>{currentAwwards ? "Escanea y reclama descuentos" : "¡Tus Descuentos!"}</h2>

      <div className={styles.scrollContainer}>
        {slides.map((slide) => (
          <div key={slide.id} className={styles.slide}>
            <AwardItem item={slide} />
          </div>
        ))}
      </div>
    </div>
  );
}
