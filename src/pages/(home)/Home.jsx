import { motion } from "framer-motion";
import { Link } from "react-router";
import { useState } from "react";
import BtnBasic from "../../components/atoms/btnBasic/btnBasic";
import styles from "./home.module.css";
export default function Home() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showError, setShowError] = useState(false);
  const appOff = import.meta.env.VITE_API_MAIN_URL;

  const handleTermsCheckboxChange = (e) => {
    const accepted = e.target.checked;
    setAcceptedTerms(accepted);
  };

  const handleTermsLinkClick = () => {};

  const handleContinueClick = (e) => {
    localStorage.removeItem("cajas");
    localStorage.removeItem("ObjectDetected");
    localStorage.removeItem("logos");
    localStorage.removeItem("product");
    localStorage.removeItem("current_match_commentary");

    if (!acceptedTerms) {
      e.preventDefault();
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className={styles.home_container}>
      <motion.div
        className={styles.user_permissions}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: 1.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <img
          src="/images/logos/logo-main-home.svg"
          alt="Permisos"
          style={{ width: "177px", height: "70px" }}
          className={styles.logoMain}
        />
        {import.meta.env.VITE_APP_OFF !== "true" && (
          <BtnBasic text="Comenzar" link="/onboarding" onClick={handleContinueClick} />
          //${styles.btnMain} ${!acceptedTerms ? styles.disabled : ""}
        )}

        <div className={styles.termsContainer}>
          <label className={styles.termsLabel}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={handleTermsCheckboxChange}
              className={styles.termsCheckbox}
            />
          </label>
          <p>
            {!showError ? "He leído y acepto" : "Acepta"} los{' '}
            <a
              href="#"
              target="_blank"
              onClick={handleTermsLinkClick}
            >
              Términos y Condiciones
            </a>
            <br></br>
            y la{' '} 
            <a
              href="#"
              target="_blank"
              onClick={handleTermsLinkClick}
            >
              Política de Privacidad.
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
