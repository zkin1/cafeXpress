import React, { useState } from 'react';
import Header from './components/Header';
import CafeList from './components/CafeList';
import PastelList from './components/PastelList';
import Carrito from './components/Carrito';
import './App.css';

function App() {
  const [categoria, setCategoria] = useState('cafe');
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (item) => {
    const itemEnCarrito = carrito.find(i => i.id === item.id);
    if (itemEnCarrito) {
      setCarrito(carrito.map(i =>
        i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      setCarrito([...carrito, { ...item, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad === 0) {
      eliminarDelCarrito(id);
    } else {
      setCarrito(carrito.map(item =>
        item.id === id ? { ...item, cantidad } : item
      ));
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.price * item.cantidad, 0);
  };

  const toggleCarrito = () => {
    setCategoria(prevCategoria => prevCategoria === 'carrito' ? 'cafe' : 'carrito');
  };

  return (
    <div className="App">
      <Header 
        categoria={categoria} 
        setCategoria={setCategoria} 
        cantidadCarrito={carrito.reduce((total, item) => total + item.cantidad, 0)}
        toggleCarrito={toggleCarrito}
      />
      <main>
        {categoria === 'cafe' && <CafeList agregarAlCarrito={agregarAlCarrito} />}
        {categoria === 'pasteles' && <PastelList agregarAlCarrito={agregarAlCarrito} />}
        {categoria === 'carrito' && (
          <Carrito 
            items={carrito}
            eliminarItem={eliminarDelCarrito}
            actualizarCantidad={actualizarCantidad}
            total={calcularTotal()}
          />
        )}
      </main>
    </div>
  );
}

export default App;