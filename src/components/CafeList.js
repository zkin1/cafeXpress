import React, { useState, useEffect } from 'react';
import CafeItem from './CafeItem';


function CafeList({ agregarAlCarrito }) {
  const [cafeItems, setCafeItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.message === 'success') {
          setCafeItems(data.data);
        } else {
          console.error('Error al obtener productos:', data.error);
        }
      })
      .catch(error => console.error('Error:', error));
  }, []);
  

  return (
    <div className="cafe-list">
      {cafeItems.map(item => (
        <CafeItem key={item.id} {...item} agregarAlCarrito={agregarAlCarrito} isCoffee={item.is_coffee} />
      ))}
    </div>
  );
}

export default CafeList;