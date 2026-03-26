import css from "./style.module.css";

export default function CtaBasic({ link }) {
  return (
    <a className={css.ctaBasic} href={link}>
      ¡Lo quiero!
    </a>
  );
}
