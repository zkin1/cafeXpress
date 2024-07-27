import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ConfirmacionPago() {
  const [status, setStatus] = useState('processing');
  const [orderDetails, setOrderDetails] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const buyOrder = localStorage.getItem('currentBuyOrder');

    if (token && buyOrder) {
      confirmTransaction(token, buyOrder);
    } else {
      setStatus('error');
    }
  }, [location]);

  const confirmTransaction = async (token, buyOrder) => {
    try {
      const response = await fetch('/api/confirm-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_ws: token, buyOrder }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setOrderDetails(data);
        // Limpiar el carrito y el buyOrder del localStorage
        localStorage.removeItem('carrito');
        localStorage.removeItem('currentBuyOrder');
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Error al confirmar la transacción:', error);
      setStatus('error');
    }
  };

  if (status === 'processing') {
    return <div>Procesando su pago...</div>;
  }

  if (status === 'success') {
    return (
      <div>
        <h2>¡Compra exitosa!</h2>
        <p>Su orden número {orderDetails.orderId} ha sido procesada correctamente.</p>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div>
        <h2>El pago no pudo ser procesado</h2>
        <p>Por favor, intente nuevamente o contacte a atención al cliente.</p>
        <button onClick={() => navigate('/carrito')}>Volver al carrito</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Ha ocurrido un error</h2>
      <p>No pudimos procesar su solicitud. Por favor, intente nuevamente más tarde.</p>
      <button onClick={() => navigate('/')}>Volver al inicio</button>
    </div>
  );
}

export default ConfirmacionPago;