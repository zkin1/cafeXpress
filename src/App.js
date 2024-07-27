import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import CafeList from './components/CafeList';
import PastelList from './components/PastelList';
import Carrito from './components/Carrito';
import Comandas from './components/Comandas';
import LoginEmpleado from './components/LoginEmpleado';
import ConfirmacionPago from './components/ConfirmacionPago';
import './App.css';

function App() {
  const [categoria, setCategoria] = useState('cafe');
  const [carrito, setCarrito] = useState([]);
  const [esEmpleado, setEsEmpleado] = useState(false);

  useEffect(() => {
    const empleadoAutenticado = localStorage.getItem('empleadoAutenticado');
    if (empleadoAutenticado) {
      setEsEmpleado(true);
    }
    
    // Cargar carrito desde localStorage
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  useEffect(() => {
    // Guardar carrito en localStorage cuando cambie
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const handleEmpleadoLogin = () => {
    setEsEmpleado(true);
    localStorage.setItem('empleadoAutenticado', 'true');
  };

  const handleEmpleadoLogout = () => {
    setEsEmpleado(false);
    localStorage.removeItem('empleadoAutenticado');
    setCategoria('cafe');
  };

  const agregarAlCarrito = (item) => {
    const itemEnCarrito = carrito.find(i => i.id === item.id && i.size === item.size && i.milk === item.milk);
    if (itemEnCarrito) {
      setCarrito(carrito.map(i =>
        i.id === item.id && i.size === item.size && i.milk === item.milk
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      ));
    } else {
      setCarrito([...carrito, { ...item, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id, size, milk) => {
    setCarrito(carrito.filter(item => !(item.id === id && item.size === size && item.milk === milk)));
  };

  const actualizarCantidad = (id, cantidad, size, milk) => {
    if (cantidad === 0) {
      eliminarDelCarrito(id, size, milk);
    } else {
      setCarrito(carrito.map(item =>
        item.id === id && item.size === size && item.milk === milk ? { ...item, cantidad } : item
      ));
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.price * item.cantidad, 0);
  };

  const toggleCarrito = () => {
    setCategoria(prevCategoria => prevCategoria === 'carrito' ? 'cafe' : 'carrito');
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem('carrito');
  };

  return (
    <Router>
      <div className="App">
        <Header 
          categoria={categoria} 
          setCategoria={setCategoria} 
          cantidadCarrito={carrito.reduce((total, item) => total + item.cantidad, 0)}
          toggleCarrito={toggleCarrito}
          esEmpleado={esEmpleado}
          onEmpleadoLogout={handleEmpleadoLogout}
        />
        <Routes>
          <Route path="/" element={
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
          } />
          <Route path="/empleado" element={
            esEmpleado ? <Comandas /> : <LoginEmpleado onLogin={handleEmpleadoLogin} />
          } />
          <Route path="/confirm-payment" element={
            <ConfirmacionPago limpiarCarrito={limpiarCarrito} />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;