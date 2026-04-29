import React, { useState } from 'react';
import styles from './styles.module.css';
import BntBasic from '../../../atoms/btnBasic/btnBasic';

const STEPS = [1, 2, 3, 4, 5, 6, 7];

export default function ModalReferee({ onClose }) {
    const [value, setValue] = useState(2);
    const [submitted, setSubmitted] = useState(false);

    const fillPercent = ((value - 1) / (STEPS.length - 1)) * 100;

    if (submitted) {
        return (
            <div className={styles.resultContainer}>
                <p className={styles.winText}>¡BUENA APUESTA! MIENTRAS,<br /> REFRÉSCATE CON ANDINA</p>
                <img className={styles.imgAward} src="/images/products/img-award.png" alt="Imagen premio" />
            </div>
        );
    }

    return (
        <>
            <div className={styles.modalContainer}>
                <p className={styles.questionText}>
                    ¿Cuántas Tarjetas Amarillas habrán<br />en el partido de hoy?
                </p>

                <div className={styles.sliderArea}>
                    <input
                        type="range"
                        min={1}
                        max={7}
                        step={1}
                        value={value}
                        onChange={e => setValue(Number(e.target.value))}
                        className={styles.sliderInput}
                        style={{ '--fill-percent': `${fillPercent}%` }}
                    />
                    <div className={styles.ticksRow}>
                        {STEPS.map(n => <span key={n} className={styles.tick} />)}
                    </div>
                    <div className={styles.labelsRow}>
                        {STEPS.map(n => (
                            <span key={n} className={styles.labelStep}>{n}</span>
                        ))}
                    </div>
                </div>

                <p className={styles.resultText}>
                    {value} Tarjeta{value !== 1 ? 's' : ''} Amarilla{value !== 1 ? 's' : ''}
                </p>
            </div>
            <button className={styles.button} onClick={() => setSubmitted(true)}>Listo</button>
        </>
    );
}
