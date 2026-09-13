import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Edición demo aislada: cualquier ruta bajo /demo monta la app con datos de
// "Atleta Ejemplo" y ventanas de estado propias, sin tocar una cuenta real.
const isDemoEdition =
  typeof window !== 'undefined' &&
  window.location.pathname.startsWith('/demo');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App demoEdition={isDemoEdition} />
  </React.StrictMode>
);
