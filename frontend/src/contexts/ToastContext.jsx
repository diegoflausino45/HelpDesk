import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const addToast = (mensagem, tipo = 'sucesso', duracao = 3000) => {
    switch (tipo) {
      case 'sucesso':
        return toast.success(mensagem, { duration: duracao });
      case 'erro':
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

  const removerToast = (id) => {
    toast.dismiss(id);
  };

  return (
    <ToastContext.Provider value={{ addToast, removerToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};
