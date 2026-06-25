import styles from "./styles.module.css";

export default function AwardItem({ item }) {
  const { image, name, oldPrice, newPrice, discount, locked } = item;

  return (
    <div className={styles.awardCard}>
      {discount && (
        <div className={styles.discountBadge}>
          <img
            src="/images/icons/ico-discount.png"
            alt="Icono descuento"
            width="20"
            height="36"
          />
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
