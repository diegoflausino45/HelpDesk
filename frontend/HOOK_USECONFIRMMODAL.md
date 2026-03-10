# 🎯 Hook useConfirmModal - Guia Rápido

## Instalação

O hook já está disponível em `/src/hooks/useConfirmModal.js`

## Uso Básico

```jsx
import useConfirmModal from '../../hooks/useConfirmModal'
import ConfirmDialog from '../../components/Modal/confirmDialog'

function MyComponent() {
  const deleteModal = useConfirmModal()

  const confirmDelete = async () => {
    deleteModal.startLoading()
    try {
      await api.delete(deleteModal.data.id)
      toast.success('Excluído com sucesso!')
      deleteModal.closeModal()
    } catch (error) {
      toast.error('Erro ao excluir')
    } finally {
      deleteModal.stopLoading()
    }
  }

  return (
    <>
      <button onClick={() => deleteModal.openModal(item)}>
        Excluir
      </button>
      
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir "${deleteModal.data?.name}"?`}
        confirmText="Sim, excluir"
        variant="delete"
        isLoading={deleteModal.isLoading}
      />
    </>
  )
}
```

## API do Hook

```typescript
const modal = useConfirmModal()

// Propriedades
modal.isOpen      // boolean - Se o modal está aberto
modal.data        // any - Dados passados ao abrir
modal.isLoading   // boolean - Estado de loading

// Métodos
modal.openModal(data)   // Abre o modal com dados opcionais
modal.closeModal()      // Fecha e limpa todos os estados
modal.startLoading()    // Ativa loading
modal.stopLoading()     // Desativa loading
```

## Benefícios

### ❌ Sem o Hook (Código Verboso)
```jsx
const [showModal, setShowModal] = useState(false)
const [item, setItem] = useState(null)
const [loading, setLoading] = useState(false)

const handleDelete = (itemData) => {
  setItem(itemData)
  setShowModal(true)
}

const confirm = async () => {
  setLoading(true)
  try {
    await api.delete(item.id)
    setShowModal(false)
    setItem(null)
  } finally {
    setLoading(false)
  }
}
```

### ✅ Com o Hook (Código Limpo)
```jsx
const modal = useConfirmModal()

const confirm = async () => {
  modal.startLoading()
  try {
    await api.delete(modal.data.id)
    modal.closeModal()
  } finally {
    modal.stopLoading()
  }
}
```

## Múltiplos Modais

```jsx
function Component() {
  const deleteModal = useConfirmModal()
  const editModal = useConfirmModal()
  const archiveModal = useConfirmModal()

  return (
    <>
      <button onClick={() => deleteModal.openModal(item)}>Excluir</button>
      <button onClick={() => editModal.openModal(item)}>Editar</button>
      <button onClick={() => archiveModal.openModal(item)}>Arquivar</button>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        variant="delete"
        {...}
      />

      <ConfirmDialog
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onConfirm={handleEdit}
        variant="edit"
        {...}
      />

      <ConfirmDialog
        isOpen={archiveModal.isOpen}
        onClose={archiveModal.closeModal}
        onConfirm={handleArchive}
        variant="warning"
        {...}
      />
    </>
  )
}
```

## Padrão Avançado - Modal Dinâmico

```jsx
function Component() {
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
        case 'activate':
          await api.activate(item.id)
          break
      }
      modal.closeModal()
    } finally {
      modal.stopLoading()
    }
  }

  const getModalConfig = () => {
    const configs = {
      delete: {
        title: 'Confirmar Exclusão',
        message: 'Deseja excluir este item?',
        variant: 'delete'
      },
      archive: {
        title: 'Arquivar Item',
        message: 'Deseja arquivar este item?',
        variant: 'warning'
      },
      activate: {
        title: 'Ativar Item',
        message: 'Deseja ativar este item?',
        variant: 'info'
      }
    }
    return configs[modal.data?.action] || {}
  }

  const config = getModalConfig()

  return (
    <>
      <button onClick={() => handleAction('delete', item)}>Excluir</button>
      <button onClick={() => handleAction('archive', item)}>Arquivar</button>
      <button onClick={() => handleAction('activate', item)}>Ativar</button>

      <ConfirmDialog
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        onConfirm={confirmAction}
        title={config.title}
        message={config.message}
        variant={config.variant}
        isLoading={modal.isLoading}
      />
    </>
  )
}
```

## Boas Práticas

✅ **FAÇA:**
- Use um hook separado para cada tipo de modal
- Sempre use `startLoading()` e `stopLoading()` em operações async
- Chame `closeModal()` após operação bem-sucedida
- Adicione try/catch com toast notifications

❌ **NÃO FAÇA:**
- Reutilizar o mesmo hook para múltiplas ações diferentes
- Esquecer de parar o loading no finally
- Fechar o modal antes da operação completar

## Migração de Código Existente

Se você tem código usando `useState` diretamente, pode migrar facilmente:

```jsx
// Antes
const [showModal, setShowModal] = useState(false)
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)

// Depois
const modal = useConfirmModal()

// Substitua:
setShowModal(true) → modal.openModal(data)
setShowModal(false) → modal.closeModal()
setLoading(true) → modal.startLoading()
setLoading(false) → modal.stopLoading()
showModal → modal.isOpen
data → modal.data
loading → modal.isLoading
```

## Exemplos Completos

Veja exemplos práticos detalhados em:
`/src/hooks/useConfirmModal.examples.jsx`

## Suporte

Dúvidas? Confira os componentes implementados:
- `/src/containers/configuracoes/configuracoes.jsx`
- `/src/containers/usuarios/usuarios.jsx`
- `/src/containers/configuracoes/components/SetoresManager.jsx`
