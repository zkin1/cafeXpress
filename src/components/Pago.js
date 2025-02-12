import React, { useState } from 'react';
import '../styles/Pago.css';

function Pago({ onSubmit, onCancel, total }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          customerEmail: email,
          customerName: name,
          orderDetails: JSON.parse(localStorage.getItem('carrito') || '[]')
        }),
      });

      if (!response.ok) {
        throw new Error('Error al iniciar la transacción');
      }

      const data = await response.json();
      
      localStorage.setItem('currentBuyOrder', data.buyOrder);
      window.location.href = data.url;
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pago-overlay">
      <form className="pago-form" onSubmit={handleSubmit}>
        <h2>Información de Pago</h2>
        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="total-amount">
          <p>Total a pagar: ${total.toFixed(2)}</p>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Pagar con WebPay'}
        </button>
        <button type="button" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default Pago;