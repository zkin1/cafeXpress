import React from 'react';
import CafeItem from './CafeItem';
import '../styles/PastelList.css';

function PastelList({ agregarAlCarrito }) {
  const pastelItems = [
    { id: 4, name: 'Cheesecake', description: 'Tarta de queso cremosa', price: 20, imageUrl: 'https://via.placeholder.com/200x200?text=Cheesecake' },
    { id: 5, name: 'Tarta de Manzana', description: 'Tarta clásica de manzana', price: 18, imageUrl: 'https://via.placeholder.com/200x200?text=Tarta+de+Manzana' },
    { id: 6, name: 'Brownie', description: 'Brownie de chocolate', price: 15, imageUrl: 'https://via.placeholder.com/200x200?text=Brownie' },
  ];

  return (
    <div className="pastel-list">
      {pastelItems.map(item => (
        <CafeItem key={item.id} {...item} agregarAlCarrito={agregarAlCarrito} isCoffee={false} />
      ))}
    </div>
  );
}

export default PastelList;