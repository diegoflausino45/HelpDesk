/**
 * ToastContext.jsx — Camada de abstração sobre react-hot-toast.
 *
 * Expõe `addToast(mensagem, tipo, duração)` e `removerToast(id)` para
 * que os componentes não precisem importar `toast` diretamente.
 *
 * Tipos suportados: 'sucesso' | 'erro' | 'aviso' | 'info'
 */
import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

// Contexto interno — não exportado para forçar uso do hook `useToast`
const ToastContext = createContext();

/**
 * Provider que deve envolver a aplicação (geralmente em App.jsx).
 * Injeta `addToast` e `removerToast` na árvore de componentes.
 */
export const ToastProvider = ({ children }) => {
  /**
   * Exibe uma notificação toast.
   * @param {string} mensagem - Texto do toast
   * @param {'sucesso'|'erro'|'aviso'|'info'} tipo - Estilo visual
   * @param {number} duracao - Duração em ms (padrão: 3000)
   */
  const addToast = (mensagem, tipo = 'sucesso', duracao = 3000) => {
    switch (tipo) {
      case 'sucesso':
        return toast.success(mensagem, { duration: duracao });
      case 'erro':
        // Erros recebem duração maior por padrão para dar tempo de leitura
        return toast.error(mensagem, { duration: duracao || 5000 });
      case 'aviso':
        return toast(mensagem, { 
          icon: '⚠️',
          duration: duracao 
        });
      case 'info':
        return toast(mensagem, { 
          icon: 'ℹ️',
          duration: duracao 
        });
      default:
        return toast(mensagem, { duration: duracao });
    }
  };

  /** Remove um toast ativo pelo ID retornado por `addToast`. */
  const removerToast = (id) => {
    toast.dismiss(id);
  };

  return (
    <ToastContext.Provider value={{ addToast, removerToast }}>
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Hook para consumir o contexto de toast.
 * Lança erro se usado fora de ToastProvider.
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};
