import React from 'react';
import CafeItem from './CafeItem';
import '../styles/CafeList.css';

function CafeList({ agregarAlCarrito }) {
  const cafeItems = [
    { id: 1, name: 'Café Americano', description: 'Café negro clásico', price: 10, imageUrl: 'https://via.placeholder.com/200x200?text=Café+Americano' },
    { id: 2, name: 'Cappuccino', description: 'Espresso con leche espumosa', price: 15, imageUrl: 'https://via.placeholder.com/200x200?text=Cappuccino' },
    { id: 3, name: 'Latte', description: 'Café con leche cremosa', price: 12, imageUrl: 'https://via.placeholder.com/200x200?text=Latte' },
  ];

  return (
    <div className="cafe-list">
      {cafeItems.map(item => (
        <CafeItem key={item.id} {...item} agregarAlCarrito={() => agregarAlCarrito(item)} />
      ))}
    </div>
  );
}

export default CafeList;