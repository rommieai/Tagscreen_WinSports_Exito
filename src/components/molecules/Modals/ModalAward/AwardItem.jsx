import styles from "./styles.module.css";

export default function AwardItem({ item }) {
  const {
    image,
    title,
    originalPrice,
    discountPrice,
    discountPercent,
    buyUrl,
    locked,
  } = item;

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className={styles.awardCard}>

      {/* Product image */}
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.productImage} />
      </div>

    </div>
  );
}
