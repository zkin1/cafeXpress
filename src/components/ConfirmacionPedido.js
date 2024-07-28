import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ConfirmacionPedido.css';

function ConfirmacionPedido({ total, onConfirm, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [notificacionEmail, setNotificacionEmail] = useState(false);
  const [emailNotificacion, setEmailNotificacion] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulación de una transacción exitosa
      const orderNumber = Math.floor(100000 + Math.random() * 900000); // Número de orden aleatorio
      const orderData = {
        orderNumber,
        customerName: nombre,
        notificacionEmail,
        emailNotificacion: notificacionEmail ? emailNotificacion : null,
        total,
        items: JSON.parse(localStorage.getItem('carrito') || '[]')
      };

      // Enviar datos al backend
      const response = await fetch('http://localhost:3001/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Error al crear la orden');
      }

      const responseData = await response.json();

      // Guardar información relevante en localStorage
      localStorage.setItem('currentOrder', JSON.stringify({
        orderId: responseData.orderId,
        orderNumber: orderNumber,
        customerName: nombre,
        total: total
      }));

      // Limpiar el carrito
      localStorage.removeItem('carrito');

      // Redirigir a una página de confirmación
      navigate('/confirm-payment');
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="confirmacion-pedido-overlay">
      <div className="confirmacion-pedido-card">
        <h2>Confirmar Pedido</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            required
          />
          <label className="notification-checkbox">
            <input
              type="checkbox"
              checked={notificacionEmail}
              onChange={(e) => setNotificacionEmail(e.target.checked)}
            />
            Notificarme cuando mi pedido esté listo
          </label>
          {notificacionEmail && (
            <input
              type="email"
              value={emailNotificacion}
              onChange={(e) => setEmailNotificacion(e.target.value)}
              placeholder="Email para notificaciones"
              required
            />
          )}
          <p className="total-amount">Total a pagar: ${total.toFixed(2)}</p>
          <div className="button-group">
            <button type="submit" className="confirm-button">Proceder al pago</button>
            <button type="button" onClick={onCancel} className="cancel-button">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConfirmacionPedido;