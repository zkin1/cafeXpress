import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header({ categoria, setCategoria, cantidadCarrito, toggleCarrito }) {
  return (
    <nav className="header">
      <div className="nav-items">
        <button 
          className={`nav-btn ${categoria === 'cafe' ? 'active' : ''}`}
          onClick={() => setCategoria('cafe')}
        >
          Café
        </button>
        <button 
          className={`nav-btn ${categoria === 'pasteles' ? 'active' : ''}`}
          onClick={() => setCategoria('pasteles')}
        >
          Pasteles
        </button>
      </div>
      <div className={`cart-icon ${categoria === 'carrito' ? 'active' : ''}`} onClick={toggleCarrito}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span className="cart-count">{cantidadCarrito}</span>
      </div>
    </nav>
  );
}

export default Header;