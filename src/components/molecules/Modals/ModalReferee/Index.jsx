import React, { useState } from 'react';
import styles from './styles.module.css';

const STEPS = [1, 2, 3, 4, 5, 6, 7];

export default function ModalReferee() {
    const [value, setValue] = useState(2);

    const fillPercent = ((value - 1) / (STEPS.length - 1)) * 100;

    return (
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
    );
}
