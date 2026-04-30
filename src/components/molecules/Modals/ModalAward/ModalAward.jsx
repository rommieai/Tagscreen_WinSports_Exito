import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import AwardItem from "./AwardItem";

const PRODUCT_MAP = {
  product_1: { image: "/images/products/img-gaseosa-postobon.png", name: "Gaseosa POSTOBON Duo",     oldPrice: "$12.000", newPrice: "$6.000",    discount: "-50" },
  product_2: { image: "/images/products/img-cerveza-andina.png",   name: "Six Pack Cerveza Andina", oldPrice: "$50.000", newPrice: "$25.000",   discount: "-50" },
  product_3: { image: "/images/products/img-nike-balon.png",       name: "Balón Nike Pitch",        oldPrice: "$100.000",newPrice: "$50.000",   discount: "-50" },
  product_4: { image: "/images/products/img-product-adidas.png",   name: "Zapatillas Adidas",       oldPrice: "$300.000",newPrice: "$165.000",  discount: "-45" },
};

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

  const activeSlides = productsArray.map((prod, i) => {
    const info = PRODUCT_MAP[prod];
    return {
      id: `prod-${i}`,
      image: info?.image ?? "/images/products/disabled-product-1.png",
      name: info?.name ?? prod,
      oldPrice: info?.oldPrice,
      newPrice: info?.newPrice,
      discount: info?.discount,
    };
  });

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
