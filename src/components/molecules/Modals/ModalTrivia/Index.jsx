import React, { useState, useEffect } from 'react';
import triviaData from './data.json';
import styles from './styles.module.css';

const PRODUCT_MAP = {
    1: { name: 'Gaseosa POSTOBON Duo',      oldPrice: '$12.000',  newPrice: '$6.000',    img: '/images/products/img-gaseosa-postobon.png' },
    2: { name: 'Six Pack Cerveza Andina',    oldPrice: '$50.000',  newPrice: '$25.000',   img: '/images/products/img-cerveza-andina.png' },
    3: { name: 'Balon Nike Pitch Training',  oldPrice: '$100.000', newPrice: '$50.000',   img: '/images/products/img-nike-balon.png' },
    4: { name: 'Zapatillas Adidas',          oldPrice: '$300.000', newPrice: '$165.000',  img: '/images/products/img-product-adidas.png' },
};

export default function ModalTrivia(equipo) {
    const [questionObj, setQuestionObj] = useState(null);
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const teamKey = equipo.data;

        console.log(teamKey)
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

        let productData = { products: [] };
        try {
            const existingProduct = localStorage.getItem('product');
            productData = existingProduct ? JSON.parse(existingProduct) : { products: [] };
            if (!Array.isArray(productData.products)) productData.products = [];
        } catch (e) {
            productData = { products: [] };
        }

        if (equipo.data === 'millonarios' || equipo.data === 'nacional') {
            const nextIndex = (productData.products.length % 4) + 1;
            setSelectedProduct(PRODUCT_MAP[nextIndex]);
            productData.products.push(`product_${nextIndex}`);

            try {
                localStorage.setItem('product', JSON.stringify(productData));
            } catch (e) {
                console.error('Error guardando en localStorage', e);
            }
        }
    };

    if (!questionObj) {
        return null;
    }

    const { question, options, correctOptionId } = questionObj;
    const isCorrect = selectedOptionId === correctOptionId;
    const correctOptionText = options.find((o) => o.id === correctOptionId)?.text;

    if (showResult) {
        return (
                <div className={styles.resultCard}>
                    {isCorrect ? (
                        <p className={styles.winText}>¡CORRECTO!<br />ERES UN GRAN HINCHA</p>
                    ) : (
                        <p className={styles.loseText}>
                            ¡CASI!, LA RESPUESTA CORRECTA ES:<br />
                            <strong>{correctOptionText}</strong>
                        </p>
                    )}
                    {selectedProduct && (
                        <div className={styles.resultRow}>
                            <img
                                className={styles.productImg}
                                src={selectedProduct.img}
                                alt={selectedProduct.name}
                            />
                            <div className={styles.productInfo}>
                                <div className={styles.productTexts}>
                                    <p className={styles.productName}>{selectedProduct.name}</p>
                                    <p className={styles.productPrice}>
                                        <span className={styles.priceOld}>{selectedProduct.oldPrice}</span>
                                        {' '}
                                        <span className={styles.priceNew}>{selectedProduct.newPrice}</span>
                                    </p>
                                </div>
                                <button className={styles.buyButton}>Comprar</button>
                            </div>
                        </div>
                    )}
                </div>
        );
    }

    return (
        <div className={styles.modalContainer}>
            <p className={styles.questionText}>{question}</p>
            <div className={styles.optionsContainer}>
                {options.map((option) => (
                    <button
                        key={option.id}
                        className={styles.optionButton}
                        onClick={() => handleOptionClick(option.id)}
                        disabled={showResult}
                    >
                        {option.text}
                    </button>
                ))}
            </div>
        </div>
    );
}
