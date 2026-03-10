import { useState } from 'react';

/**
 * Hook customizado para gerenciar estados de modais de confirmação
 * 
 * @example
 * const { 
 *   isOpen, 
 *   data, 
 *   isLoading,
 *   openModal, 
 *   closeModal, 
 *   startLoading,
 *   stopLoading 
 * } = useConfirmModal();
 * 
 * // Abrir modal com dados
 * openModal({ id: 123, name: 'Item' });
 * 
 * // Processar confirmação
 * const handleConfirm = async () => {
 *   startLoading();
 *   try {
 *     await api.delete(data.id);
 *     closeModal();
 *   } finally {
 *     stopLoading();
 *   }
 * };
 */
function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setData(null);
    setIsLoading(false);
  };

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return {
    isOpen,
    data,
    isLoading,
    openModal,
    closeModal,
    startLoading,
    stopLoading,
  };
}

export default useConfirmModal;
