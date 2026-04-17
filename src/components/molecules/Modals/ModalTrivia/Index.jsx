import React, { useState, useEffect } from 'react';
import triviaData from './data.json';
import styles from './styles.module.css';
import MessageBasic from '../../../MessageBasic/MessageBasic';

export default function ModalTrivia(equipo) {
    const [questionObj, setQuestionObj] = useState(null);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const teamKey = equipo.data;

        if (teamKey) {
            if (triviaData[teamKey]) {
                const questions = triviaData[teamKey];
                const randomIndex = Math.floor(Math.random() * questions.length);

                setQuestionObj(questions[randomIndex]);
                setSelectedOptionId(null);
                setShowResult(false);
                setNotFound(false);
            } else {
                setNotFound(true);
            }
        }
    }, [equipo.data]);

    const handleOptionClick = (optionId) => {
        if (showResult) return;

        setSelectedOptionId(optionId);
        setShowResult(true);

        try {
            const existingProduct = localStorage.getItem('product');
            let productData = existingProduct ? JSON.parse(existingProduct) : { products: [] };

            if (!Array.isArray(productData.products)) {
                productData.products = [];
            }

            let productToAdd = "";
            if (equipo.data === 'Millonarios' || equipo.data === 'Nacional') {
                productToAdd = 'product_1';
            } else if (equipo.data === 'DIM' || equipo.data === 'SFE') {
                productToAdd = 'product_2';
            }

            if (productToAdd !== "") {
                productData.products.push(productToAdd);
            }

            localStorage.setItem('product', JSON.stringify(productData));
        } catch (e) {
            console.error('Error manejando localStorage', e);
            let productToAdd = "";
            if (equipo.data === 'Millonarios' || equipo.data === 'Nacional') {
                productToAdd = 'product_1';
            } else if (equipo.data === 'DIM' || equipo.data === 'SFE') {
                productToAdd = 'product_2';
            }
            localStorage.setItem(
                'product',
                JSON.stringify({ products: productToAdd ? [productToAdd] : [] })
            );
        }
    };

    if (!questionObj) {
        return null;
    }

    const { question, options, correctOptionId } = questionObj;
    const isCorrect = selectedOptionId === correctOptionId;
    const correctOptionText = options.find((o) => o.id === correctOptionId)?.text;

    return (
        <div className={styles.modalContainer}>
            {showResult ? (
                <div className={styles.resultContainer}>
                    {isCorrect ? (
                        <p className={styles.winText}>¡CORRECTO!<br></br>ERES UN GRAN HINCHA</p>
                    ) : (
                        <p className={styles.loseText}>
                            ¡CASI!, LA RESPUESTA CORRECTA ES:<br />
                            <strong>{correctOptionText}</strong>
                        </p>
                    )}
                    <img className={styles.imgAward} src="/images/products/img-award.png" alt="Imagen premio" />
                </div>
            ) : (
                <>
                    <MessageBasic message={question} />
                    <div className={styles.optionsContainer}>
                        {options.map((option) => {

                                return (
                                    <button
                                        key={option.id}
                                        className={styles.optionButton}
                                        onClick={() => handleOptionClick(option.id)}
                                        disabled={showResult}
                                    >
                                        {option.text}
                                    </button>
                                );
                            })}
                        </div>
                        </>
            )}
        </div>
    );
}