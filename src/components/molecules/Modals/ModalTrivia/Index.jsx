import React, { useState, useEffect } from 'react';
import triviaData from './data.json';
import styles from './styles.module.css';

const PRODUCTS = {
    nacional: [
        { name: 'Zapatillas Adidas', oldPrice: '$300.000', newPrice: '$165.000', img: '/images/products/img-product-adidas.png' },
        { name: 'Six Pack Cerveza Andina', oldPrice: '$50.000', newPrice: '$25.000', img: '/images/products/img-cerveza-andina.png' },
    ],
    millonarios: [
        { name: 'Gaseosa POSTOBON Duo', oldPrice: '$12.000', newPrice: '$6.000', img: '/images/products/img-gaseosa-postobon.png' },
        { name: 'Balon Nike Pitch Training', oldPrice: '$100.000', newPrice: '$50.000', img: '/images/products/img-nike-balon.png' },
    ],
};

// Persists across remounts — tracks which product indices were already shown per team
const shownProductsMap = {};

function getNextProduct(teamKey) {
    const key = teamKey?.toLowerCase();
    const products = PRODUCTS[key];
    if (!products) return null;

    if (!shownProductsMap[key]) shownProductsMap[key] = new Set();
    const shown = shownProductsMap[key];

    if (shown.size >= products.length) shown.clear();

    const available = products.map((_, i) => i).filter(i => !shown.has(i));
    const pick = available[Math.floor(Math.random() * available.length)];
    shown.add(pick);

    return products[pick];
}

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
            setSelectedProduct(getNextProduct(teamKey));

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
