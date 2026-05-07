import styles from "./styles.module.css";

export default function AwardItem({ item }) {
  const { image, name, oldPrice, newPrice, discount, locked } = item;

  return (
    <div className={styles.awardCard}>
      {discount && (
        <div className={styles.discountBadge}>
          <span className={styles.discountValue}>{discount}</span>
          <span className={styles.discountPercent}>%</span>
          <span className={styles.discountLabel}>de dcto</span>
        </div>
      )}

      <div className={styles.imageContainer}>
        <img src={image} alt={name} className={styles.productImage} />
      </div>

      {name && <p className={styles.productName}>{name}</p>}

      {oldPrice && newPrice && (
        <div className={styles.pricesRow}>
          <span className={styles.oldPrice}>{oldPrice}</span>
          <span className={styles.newPrice}>{newPrice}</span>
        </div>
      )}

      {!locked && <button className={styles.buyButton}>Comprar</button>}
    </div>
  );
}
