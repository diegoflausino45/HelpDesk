/**
 * main.jsx — Ponto de entrada do React.
 *
 * Monta o componente raiz <App> no elemento #root do index.html.
 * StrictMode habilita avisos extras de desenvolvimento (double-render,
 * lifecycle deprecado, etc.) sem impacto em produção.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'  // estilos globais: resets, tokens CSS, animações


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
