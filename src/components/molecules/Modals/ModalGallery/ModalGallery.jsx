import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./styles.module.css";
import clips from "./clips.json";

const TYPE_ICON = {
  goal: "/icons/tiny-icon-gol.svg",
  penalty: "/icons/tiny-icon-penal.svg",
  yellow_card: "/icons/tiny-icon-tarjeta-amarilla.svg",
  corner: "/icons/tiny-icon-tiro.svg",
};

const MINUTE_COLOR = {
  goal: "#CB39FF",
  penalty: "#4285F4",
  yellow_card: "#F4D437",
  corner: "#00FF8C",
};

const fadeUp = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 22, delay: 0.06 },
  },
};

function DurationBadge({ duration }) {
  return (
    <div className={styles.durationBadge}>
      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
        <polygon points="0,0 6,3 0,6" fill="white" />
      </svg>
      {duration}
    </div>
  );
}

function ClipCard({ clip, onClick }) {
  return (
    <div className={styles.clipCard} onClick={() => onClick(clip)}>
      <div className={styles.thumbWrap}>
        {clip.thumbnail ? (
          <img
            src={clip.thumbnail}
            alt={clip.title}
            className={styles.thumbImg}
          />
        ) : (
          <div className={styles.thumbPlaceholder} />
        )}
        <DurationBadge duration={clip.duration} />
      </div>

      <div className={styles.clipInfo}>
        <span
          className={styles.minute}
          style={{ color: MINUTE_COLOR[clip.type] }}
        >
          |{clip.minute}&apos;
        </span>
        <p className={styles.clipTitle}>{clip.title}</p>
        <p className={styles.clipPlayer}>{clip.player}</p>
      </div>

      <img
        src={TYPE_ICON[clip.type]}
        alt={clip.type}
        className={styles.typeIcon}
      />
    </div>
  );
}

function IcoWhatsapp() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ClipDetail({ clip, onBack }) {
  const handleShare = () => {
    const text = `|${clip.minute}' ${clip.title} — ${clip.player}`;
    if (navigator.share) {
      navigator
        .share({
          title: clip.title,
          text,
          url: clip.videoUrl || window.location.href,
        })
        .catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <motion.div
      className={styles.detailContainer}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.detailInnerArea}>
        <div className={styles.detailHeader}>
          <button
            className={styles.backBtn}
            onClick={onBack}
            aria-label="Volver"
          >
            <svg width="20" height="16" viewBox="0 0 22 18" fill="none">
              <path
                d="M9 1L1 9l8 8M1 9h20"
                stroke="#2b2b2b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className={styles.detailDivider} />

          <span
            className={styles.detailMinute}
            style={{ color: MINUTE_COLOR[clip.type] }}
          >
            |{clip.minute}&apos;
          </span>

          <div className={styles.detailTextBlock}>
            <p className={styles.detailTitle}>{clip.title}</p>
            <p className={styles.detailPlayer}>{clip.player}</p>
          </div>
        </div>

        <div className={styles.videoWrap}>
          <video
            className={styles.videoEl}
            src={clip.videoUrl}
            poster={clip.thumbnail || undefined}
            controls
            playsInline
            preload="metadata"
          />
        </div>

        {/*<button className={styles.shareBtn} onClick={handleShare}>
          Compartir
          <IcoWhatsapp />
        </button>*/}
      </div>
    </motion.div>
  );
}

export default function ModalGallery() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return <ClipDetail clip={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <motion.div
      className={styles.galleryContainer}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.innerArea}>
        <h2 className={styles.galleryTitle}>Momentos Clave del Partido</h2>
        <div className={styles.clipsScrollArea}>
          {clips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} onClick={setSelected} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
