import React, { useState, useEffect } from 'react';
import CafeItem from './CafeItem';
import '../styles/PastelList.css';

function PastelList({ agregarAlCarrito, token }) {
  const [pastelItems, setPastelItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/products', {
      headers: {
        'x-access-token': token
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === "success") {
          setPastelItems(data.data.filter(item => item.category === 'pasteles'));
        }
      })
      .catch(error => console.error('Error:', error));
  }, [token]);

  return (
    <div className="pastel-list">
      {pastelItems.map(item => (
        <CafeItem key={item.id} {...item} agregarAlCarrito={agregarAlCarrito} isCoffee={false} />
      ))}
    </div>
  );
}

export default PastelList;