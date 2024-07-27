import React, { useState } from 'react';
import '../styles/Carrito.css';

const formatPrice = (price) => {
  return price.toFixed(2).replace(/\.00$/, '');
};

function Carrito({ items, eliminarItem, actualizarCantidad, total }) {
  const [showForm, setShowForm] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleCheckout = () => {
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        total_amount: total,
        status: 'pending',
        items: items.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          price: item.price,
          size: item.size,
          milk: item.milk
        }))
      }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw err; });
      }
      return response.json();
    })
    .then(data => {
      setOrderConfirmation({ name, email, orderCode: data.orderId });
      // Aquí podrías limpiar el carrito si es necesario
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Hubo un error al procesar tu orden. Por favor, intenta de nuevo.');
    });
  };

  if (orderConfirmation) {
    return (
      <div className="order-confirmation">
        <h2>¡Compra exitosa!</h2>
        <p>Gracias por tu compra, {orderConfirmation.name}.</p>
        <p>Tu código de pedido es: <strong>{orderConfirmation.orderCode}</strong></p>
        <p>Hemos enviado un correo de confirmación a {orderConfirmation.email}.</p>
      </div>
    );
  }

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
          {!showForm ? (
            <button className="checkout-btn" onClick={handleCheckout}>Proceder al pago</button>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <button type="submit">Confirmar pedido</button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default Carrito;