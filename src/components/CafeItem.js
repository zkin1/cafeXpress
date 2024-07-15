import React from 'react';
import '../styles/CafeItem.css';

function CafeItem({ id, name, description, price, imageUrl, agregarAlCarrito }) {
  return (
    <div className="cafe-item">
      <div className="cafe-image" style={{backgroundImage: `url(${imageUrl})`}}></div>
      <div className="cafe-details">
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="price-action">
          <span className="precio">${price}</span>
          <button className="add-button" onClick={agregarAlCarrito}>
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CafeItem;