import React, { useState } from 'react';
import '../styles/Pago.css';

function Pago({ onSubmit, onCancel }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí simularemos el proceso de pago
    setTimeout(() => {
      const orderCode = Math.random().toString(36).substr(2, 9).toUpperCase();
      onSubmit({ email, name, orderCode });
    }, 2000);
  };

  return (
    <div className="pago-overlay">
      <form className="pago-form" onSubmit={handleSubmit}>
        <h2>Información de Pago</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="webpay-simulation">
          <p>Simulación de pago WebPay</p>
          {/* Aquí puedes agregar más campos si lo deseas */}
        </div>
        <button type="submit">Procesar Pago</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </form>
    </div>
  );
}

export default Pago;