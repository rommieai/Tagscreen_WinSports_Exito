import { useState } from "react";
import css from "./styles.module.css";

export default function Instructions() {
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = () => {
    if (showMessage) {
      setShowMessage(false);
    } else {
      setShowMessage(true);
    }
  };

  return (
    <div className={css.instructions_container}>
      <div className={css.ico_instructions} onClick={handleClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="35"
          height="35"
          viewBox="0 0 35 35"
          fill="none"
        >
          <g opacity="0.85" filter="url(#filter0_d_366_59)">
            <path
              d="M31.68 6.86853L31.6754 6.82549C31.5286 5.41579 30.9012 4.09955 29.8986 3.09776C28.896 2.09598 27.5792 1.46966 26.1694 1.32398C24.1026 1.10875 20.6968 1 17.5 1C14.3032 1 10.8974 1.10875 8.83059 1.32398C7.42077 1.46966 6.10401 2.09598 5.1014 3.09776C4.09879 4.09955 3.47139 5.41579 3.32455 6.82549L3.32002 6.86853C3.14104 8.58248 3 8.85775 3 12.4726C3 16.0874 3.14104 16.6708 3.32002 18.3853L3.32455 18.4278C3.47139 19.8374 4.09879 21.1537 5.1014 22.1555C6.10401 23.1573 7.42077 23.7836 8.83059 23.9293C9.97076 24.0482 11.5187 24.1343 13.214 24.1881L16.5037 29.4121C16.6172 29.5921 16.7744 29.7405 16.9608 29.8433C17.1472 29.9462 17.3565 30.0001 17.5694 30.0001C17.7822 30.0001 17.9916 29.9462 18.178 29.8433C18.3643 29.7405 18.5216 29.5921 18.6351 29.4121L21.9276 24.1836C23.5673 24.1269 25.061 24.0448 26.1688 23.9293C27.5788 23.7837 28.8957 23.1574 29.8984 22.1556C30.9011 21.1538 31.5286 19.8375 31.6754 18.4278L31.68 18.3847C31.859 16.6708 32 16.0874 32 12.4726C32 8.85775 31.859 8.58305 31.68 6.86853ZM17.4966 21.2241C17.1165 21.2234 16.7452 21.1101 16.4295 20.8985C16.1138 20.6868 15.868 20.3864 15.723 20.035C15.578 19.6837 15.5404 19.2973 15.615 18.9246C15.6895 18.5519 15.8729 18.2097 16.1419 17.9412C16.4109 17.6727 16.7534 17.4899 17.1262 17.416C17.499 17.3421 17.8854 17.3804 18.2364 17.526C18.5875 17.6716 18.8876 17.918 19.0986 18.2341C19.3097 18.5501 19.4224 18.9216 19.4224 19.3017C19.4215 19.8119 19.2182 20.3008 18.8571 20.6613C18.4961 21.0217 18.0068 21.2241 17.4966 21.2241ZM19.3612 14.6034C19.3291 14.9006 19.1947 15.1775 18.9812 15.3867C18.7649 15.5977 18.4836 15.7293 18.1831 15.76H18.174C17.986 15.7818 17.7969 15.7927 17.6076 15.7928C17.3806 15.7939 17.1537 15.783 16.9279 15.76H16.9183C16.6171 15.7298 16.3351 15.5982 16.1185 15.3867C15.9049 15.1778 15.7705 14.9011 15.7385 14.6039C15.692 14.1701 15.6688 11.1574 15.6688 10.4862C15.6688 9.81498 15.692 6.79377 15.7385 6.36047C15.7706 6.06322 15.905 5.78635 16.1185 5.57713C16.3346 5.36631 16.6157 5.23493 16.916 5.20443H16.9257C17.1515 5.18193 17.3786 5.17511 17.6054 5.18404C17.7944 5.17508 17.9839 5.1819 18.1718 5.20443H18.1808C18.4813 5.23489 18.7626 5.36626 18.9789 5.57713C19.1923 5.78649 19.3266 6.06329 19.3589 6.36047C19.4048 6.79377 19.4286 9.81555 19.4286 10.4862C19.4286 11.1568 19.4071 14.1695 19.3612 14.6034Z"
              fill="white"
            />
          </g>
          <defs>
            <filter
              id="filter0_d_366_59"
              x="0"
              y="0"
              width="35"
              height="35"
              filterUnits="userSpaceOnUse"
              colorInterpolation="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="2" />
              <feGaussianBlur stdDeviation="1.5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_366_59"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_366_59"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
      </div>
      <div
        className={`${css.message_container} ${
          showMessage && css.print_message
        }`}
      >
        <img
          className={css.image_scanner}
          src="/images/scanner.png"
          alt="Icono Scanner"
        />
        <p>
          Apunta a la pantalla, busca a los jurados y participantes y sigue sus
          instrucciones
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="6"
          height="7"
          viewBox="0 0 6 7"
          fill="none"
          className={css.svg_arrow}
        >
          <path d="M0 3L6 6.5V0L0 3Z" fill="#C674FD" fillOpacity="0.7" />
        </svg>
      </div>
    </div>
  );
}
