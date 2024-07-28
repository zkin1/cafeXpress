import React from 'react';
import '../styles/Carrito.css';

const formatPrice = (price) => {
  return price.toFixed(2).replace(/\.00$/, '');
};

function Carrito({ items, eliminarItem, actualizarCantidad, total, onProcederPago }) {
  return (
    <div className="carrito">
      <h2>Tu Carrito</h2>
      {items.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <>
          {items.map(item => (
            <div key={`${item.id}-${item.size || ''}-${item.milk || ''}`} className="carrito-item">
              <div className="item-details">
                <h3>{item.name}</h3>
                {item.size && item.milk && (
                  <>
                    <p>Tamaño: {item.size === 'small' ? 'Pequeño' : item.size === 'medium' ? 'Mediano' : 'Grande'}</p>
                    <p>Leche: {item.milk === 'normal' ? 'Normal' : item.milk === 'descremada' ? 'Descremada' : item.milk === 'almendras' ? 'Almendras' : 'Soya'}</p>
                  </>
                )}
              </div>
              <div className="item-actions">
                <div className="cantidad-control">
                  <button className="cantidad-btn" onClick={() => actualizarCantidad(item.id, item.cantidad - 1, item.size, item.milk)}>-</button>
                  <span>{item.cantidad}</span>
                  <button className="cantidad-btn" onClick={() => actualizarCantidad(item.id, item.cantidad + 1, item.size, item.milk)}>+</button>
                </div>
                <span className="item-price">${formatPrice(item.price * item.cantidad)}</span>
                <button className="eliminar-btn" onClick={() => eliminarItem(item.id, item.size, item.milk)}>Eliminar</button>
              </div>
            </div>
          ))}
          <div className="carrito-total">
            <strong>Total: ${formatPrice(total)}</strong>
          </div>
          <button className="checkout-btn" onClick={onProcederPago}>Proceder al pago</button>
        </>
      )}
    </div>
  );
}

export default Carrito;