import React, { useState, useEffect } from 'react';
import '../styles/Comandas.css';

function Comandas() {
  const [comandas, setComandas] = useState([]);

  useEffect(() => {
    fetchComandas();
    const interval = setInterval(fetchComandas, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchComandas = () => {
    fetch('http://localhost:3001/api/comandas')
      .then(response => response.json())
      .then(data => setComandas(data.comandas))
      .catch(error => console.error('Error:', error));
  };

  const marcarComoCompletada = (comandaId) => {
    fetch(`http://localhost:3001/api/comandas/${comandaId}/completar`, { method: 'POST' })
      .then(response => response.json())
      .then(() => fetchComandas())
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="comandas">
      <h2>Comandas Pendientes</h2>
      {comandas.map(comanda => (
        <div key={comanda.id} className="comanda-item">
          <h3>Orden #{comanda.id}</h3>
          <p>Cliente: {comanda.name}</p>
          <p>Total: ${comanda.total_amount.toFixed(2)}</p>
          <ul>
            {comanda.items.map((item, index) => (
              <li key={index}>
                {item.quantity}x {item.name} 
                {item.size && ` - ${item.size}`}
                {item.milk_type && ` - Leche de ${item.milk_type}`}
              </li>
            ))}
          </ul>
          <button onClick={() => marcarComoCompletada(comanda.id)}>
            Marcar como Completada
          </button>
        </div>
      ))}
    </div>
  );
}

export default Comandas;