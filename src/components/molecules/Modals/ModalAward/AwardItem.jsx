import styles from "./styles.module.css";

export default function AwardItem({ item }) {
  const {
    image,
  } = item;
  return (
    <div className={styles.awardCard}>
      <img src={image} alt="Adwar image" className={styles.productImage} />
    </div>
  );
}
