/**
 * EXEMPLO DE REFATORAÇÃO COM useConfirmModal
 * 
 * Este arquivo demonstra como simplificar o código usando o hook useConfirmModal
 */

// ❌ ANTES - Código verboso com múltiplos estados
import { useState } from 'react'

function ComponenteAntigo() {
  const [showModal, setShowModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = (item) => {
    setItemToDelete(item)
    setShowModal(true)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      await api.delete(itemToDelete.id)
      setShowModal(false)
      setItemToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button onClick={() => handleDelete(item)}>Excluir</button>
      
      <ConfirmDialog
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setItemToDelete(null)
        }}
        onConfirm={confirmDelete}
        message={`Excluir "${itemToDelete?.name}"?`}
        isLoading={isDeleting}
        variant="delete"
      />
    </>
  )
}

// ✅ DEPOIS - Código limpo e simplificado
import useConfirmModal from '../../hooks/useConfirmModal'

function ComponenteNovo() {
  const deleteModal = useConfirmModal()

  const confirmDelete = async () => {
    deleteModal.startLoading()
    try {
      await api.delete(deleteModal.data.id)
      deleteModal.closeModal()
    } finally {
      deleteModal.stopLoading()
    }
  }

  return (
    <>
      <button onClick={() => deleteModal.openModal(item)}>Excluir</button>
      
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        message={`Excluir "${deleteModal.data?.name}"?`}
        isLoading={deleteModal.isLoading}
        variant="delete"
      />
    </>
  )
}

// 🎯 EXEMPLO COM MÚLTIPLOS MODAIS
function ComponenteComVariosModais() {
  const deleteModal = useConfirmModal()
  const editModal = useConfirmModal()
  const discardModal = useConfirmModal()

  const confirmDelete = async () => {
    deleteModal.startLoading()
    try {
      await api.delete(deleteModal.data.id)
      deleteModal.closeModal()
    } finally {
      deleteModal.stopLoading()
    }
  }

  const confirmEdit = async () => {
    editModal.startLoading()
    try {
      await api.update(editModal.data.id, editModal.data.changes)
      editModal.closeModal()
    } finally {
      editModal.stopLoading()
    }
  }

  const confirmDiscard = () => {
    resetForm()
    discardModal.closeModal()
  }

  return (
    <>
      <button onClick={() => deleteModal.openModal(item)}>Excluir</button>
      <button onClick={() => editModal.openModal({ id: item.id, changes })}>Editar</button>
      <button onClick={() => discardModal.openModal()}>Cancelar</button>
      
      {/* Modal de Exclusão */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Excluir "${deleteModal.data?.name}"?`}
        isLoading={deleteModal.isLoading}
        variant="delete"
      />

      {/* Modal de Edição */}
      <ConfirmDialog
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onConfirm={confirmEdit}
        title="Confirmar Edição"
        message="Salvar as alterações?"
        isLoading={editModal.isLoading}
        variant="edit"
      />

      {/* Modal de Descartar */}
      <ConfirmDialog
        isOpen={discardModal.isOpen}
        onClose={discardModal.closeModal}
        onConfirm={confirmDiscard}
        title="Descartar Alterações"
        message="Descartar alterações não salvas?"
        variant="warning"
      />
    </>
  )
}

// 🚀 EXEMPLO AVANÇADO - Com diferentes ações
function ComponenteAvancado() {
  const modal = useConfirmModal()

  const handleAction = (action, item) => {
    modal.openModal({ action, item })
  }

  const confirmAction = async () => {
    const { action, item } = modal.data
    
    modal.startLoading()
    try {
      switch (action) {
        case 'delete':
          await api.delete(item.id)
          break
        case 'archive':
          await api.archive(item.id)
          break
        case 'restore':
          await api.restore(item.id)
          break
      }
      modal.closeModal()
    } finally {
      modal.stopLoading()
    }
  }

  const getModalConfig = () => {
    const { action, item } = modal.data || {}
    
    const configs = {
      delete: {
        title: 'Confirmar Exclusão',
        message: `Excluir "${item?.name}"?`,
        variant: 'delete',
        confirmText: 'Sim, excluir'
      },
      archive: {
        title: 'Arquivar Item',
        message: `Arquivar "${item?.name}"?`,
        variant: 'warning',
        confirmText: 'Arquivar'
      },
      restore: {
        title: 'Restaurar Item',
        message: `Restaurar "${item?.name}"?`,
        variant: 'info',
        confirmText: 'Restaurar'
      }
    }
    
    return configs[action] || {}
  }

  const config = getModalConfig()

  return (
    <>
      <button onClick={() => handleAction('delete', item)}>Excluir</button>
      <button onClick={() => handleAction('archive', item)}>Arquivar</button>
      <button onClick={() => handleAction('restore', item)}>Restaurar</button>
      
      <ConfirmDialog
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        onConfirm={confirmAction}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        variant={config.variant}
        isLoading={modal.isLoading}
      />
    </>
  )
}

export { ComponenteAntigo, ComponenteNovo, ComponenteComVariosModais, ComponenteAvancado }
