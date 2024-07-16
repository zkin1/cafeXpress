import React, { useState, useEffect } from 'react';
import '../styles/CafeItem.css';

const formatPrice = (price) => {
  return price.toFixed(2).replace(/\.00$/, '');
};

function CafeItem({ id, name, description, price, imageUrl, agregarAlCarrito, isCoffee }) {
  const [showOptions, setShowOptions] = useState(false);
  const [size, setSize] = useState('medium');
  const [milk, setMilk] = useState('normal');
  const [adjustedPrice, setAdjustedPrice] = useState(price);

  useEffect(() => {
    if (isCoffee && size === 'small') {
      setAdjustedPrice(price - 1);
    } else if (isCoffee && size === 'large') {
      setAdjustedPrice(price + 1);
    } else {
      setAdjustedPrice(price);
    }
  }, [size, price, isCoffee]);

  const toggleOptions = () => {
    if (isCoffee) {
      setShowOptions(!showOptions);
    } else {
      handleAddToCart();
    }
  };

  const handleAddToCart = () => {
    if (isCoffee) {
      agregarAlCarrito({ id, name, description, price: adjustedPrice, size, milk });
    } else {
      agregarAlCarrito({ id, name, description, price });
    }
    setShowOptions(false);
  };

  return (
    <div className="cafe-item">
      <div className="cafe-image" style={{backgroundImage: `url(${imageUrl})`}}></div>
      <div className="cafe-details">
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="price-action">
          <span className="precio">${formatPrice(adjustedPrice)}</span>
          <button className="add-button" onClick={toggleOptions}>
            {isCoffee && showOptions ? 'Cancelar' : 'Agregar al carro'}
          </button>
        </div>
      </div>
      {isCoffee && showOptions && (
        <div className="cafe-options">
          <div className="option">
            <label>Tamaño:</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="small">Pequeño (-$1)</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande (+$1)</option>
            </select>
          </div>
          <div className="option">
            <label>Tipo de leche:</label>
            <select value={milk} onChange={(e) => setMilk(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="descremada">Descremada</option>
              <option value="almendras">Almendras</option>
              <option value="soya">Soya</option>
            </select>
          </div>
          <button className="confirm-add-button" onClick={handleAddToCart}>
            Confirmar y agregar al carrito
          </button>
        </div>
      )}
    </div>
  );
}

export default CafeItem;