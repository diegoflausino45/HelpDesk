/**
 * App.jsx — Componente raiz da aplicação.
 *
 * Responsável por:
 *   1. Prover o contexto de Toast (ToastProvider)
 *   2. Montar o roteador (RouterApp)
 *   3. Renderizar o Toaster global do react-hot-toast com estilo unificado
 */
import RouterApp from "./routes/routes"
import { Toaster } from "react-hot-toast"
import { ToastProvider } from "./contexts/ToastContext"

function App() {
  return (
    // ToastProvider precisa envolver RouterApp para que useToast funcione
    // em qualquer componente dentro da árvore de rotas
    <ToastProvider>
      <RouterApp />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ToastProvider>
  )
}

export default App
