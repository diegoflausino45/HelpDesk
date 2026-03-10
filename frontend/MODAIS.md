# Modais de Confirmação - Guia de Uso

Este projeto utiliza modais modernos e padronizados para todas as confirmações de ações críticas.

## Componentes Disponíveis

### 1. `ConfirmDialog` 

Modal de confirmação para ações que requerem validação do usuário.

**Importação:**
```jsx
import ConfirmDialog from '../../components/Modal/confirmDialog'
```

**Props:**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `isOpen` | boolean | - | Controla se o modal está aberto |
| `onClose` | function | - | Callback para fechar o modal |
| `onConfirm` | function | - | Callback executado ao confirmar |
| `title` | string | - | Título do modal |
| `message` | string | - | Mensagem explicativa |
| `confirmText` | string | "Confirmar" | Texto do botão de confirmação |
| `cancelText` | string | "Cancelar" | Texto do botão de cancelamento |
| `variant` | string | "warning" | Variante visual: `danger`, `delete`, `warning`, `info`, `edit` |
| `isLoading` | boolean | false | Mostra loading durante processamento |

**Variantes:**
- `delete` / `danger`: Vermelho - para exclusões
- `warning`: Laranja - para avisos
- `edit`: Azul/roxo - para edições
- `info`: Azul - para informações

## Exemplos de Uso

### 1. Confirmação de Exclusão

```jsx
import { useState } from 'react'
import ConfirmDialog from '../../components/Modal/confirmDialog'

function MyComponent() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      await api.delete(itemToDelete.id)
      toast.success('Item excluído com sucesso!')
      setShowDeleteModal(false)
      setItemToDelete(null)
      // Recarregar dados...
    } catch (error) {
      toast.error('Erro ao excluir item')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button onClick={() => handleDeleteClick(item)}>
        Excluir
      </button>

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        variant="delete"
        isLoading={isDeleting}
      />
    </>
  )
}
```

### 2. Confirmação de Edição

```jsx
const [showEditModal, setShowEditModal] = useState(false)
const [isSaving, setIsSaving] = useState(false)

const confirmEdit = async () => {
  try {
    setIsSaving(true)
    await api.update(data)
    toast.success('Atualizado com sucesso!')
    setShowEditModal(false)
  } catch (error) {
    toast.error('Erro ao atualizar')
  } finally {
    setIsSaving(false)
  }
}

<ConfirmDialog
  isOpen={showEditModal}
  onClose={() => setShowEditModal(false)}
  onConfirm={confirmEdit}
  title="Confirmar Edição"
  message="Deseja salvar as alterações realizadas?"
  confirmText="Sim, salvar"
  cancelText="Cancelar"
  variant="edit"
  isLoading={isSaving}
/>
```

### 3. Aviso ao Descartar Alterações

```jsx
const [showDiscardModal, setShowDiscardModal] = useState(false)

const handleCancel = () => {
  if (hasUnsavedChanges) {
    setShowDiscardModal(true)
  }
}

const confirmDiscard = () => {
  resetForm()
  setShowDiscardModal(false)
}

<ConfirmDialog
  isOpen={showDiscardModal}
  onClose={() => setShowDiscardModal(false)}
  onConfirm={confirmDiscard}
  title="Descartar Alterações"
  message="Tem certeza que deseja descartar todas as alterações não salvas?"
  confirmText="Sim, descartar"
  cancelText="Continuar editando"
  variant="warning"
/>
```

### 4. Confirmação Simples (Informação)

```jsx
<ConfirmDialog
  isOpen={showInfoModal}
  onClose={() => setShowInfoModal(false)}
  onConfirm={handleConfirm}
  title="Informação Importante"
  message="Esta ação irá notificar todos os usuários envolvidos."
  confirmText="Entendi, continuar"
  cancelText="Cancelar"
  variant="info"
/>
```

## Boas Práticas

### ✅ FAÇA:
- Use `variant="delete"` ou `variant="danger"` para ações destrutivas
- Sempre explique as consequências da ação na mensagem
- Use loading state (`isLoading`) durante operações assíncronas
- Limpe os estados após fechar o modal
- Use mensagens claras e diretas

### ❌ NÃO FAÇA:
- Usar `window.confirm()` ou `window.alert()`
- Deixar mensagens genéricas como "Tem certeza?"
- Esquecer de resetar estados ao fechar o modal
- Omitir loading states em operações demoradas

## Implementações Existentes

Exemplos já implementados no projeto:

1. **Configurações** (`/containers/configuracoes/configuracoes.jsx`)
   - Descartar alterações não salvas

2. **Setores** (`/containers/configuracoes/components/SetoresManager.jsx`)
   - Excluir setor
   - Editar setor

3. **Usuários** (`/containers/usuarios/usuarios.jsx`)
   - Excluir usuário

## Recursos Visuais

### Animações
- ✨ Fade-in suave do backdrop com blur
- 🎯 Slide-up com bounce effect no modal
- 🔄 Rotação do ícone X ao fechar
- 📊 Scale-in no ícone de confirmação
- 🎭 Hover effects em todos os botões

### Acessibilidade
- ⌨️ Fecha com tecla ESC
- 🖱️ Fecha clicando no overlay
- 🎯 Focus trap dentro do modal
- 📢 ARIA labels apropriados
- 🚫 Scroll bloqueado quando aberto

### Responsivo
- 📱 Largura total em mobile
- 📍 Posicionamento otimizado
- 🔘 Botões empilhados verticalmente em telas pequenas
- 👆 Touch-friendly

## Modal Base

Para casos mais complexos que não se encaixam no ConfirmDialog, use o Modal base:

```jsx
import Modal from '../../components/Modal/modal'

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Meu Modal"
  size="medium"  // "small", "medium", "large"
  variant="default"  // "danger", "warning", "info", "edit"
  footer={
    <div>
      <button onClick={onClose}>Cancelar</button>
      <button onClick={onSave}>Salvar</button>
    </div>
  }
>
  {/* Conteúdo personalizado */}
</Modal>
```

## Suporte

Para dúvidas ou melhorias, consulte os componentes em:
- `/src/components/Modal/modal.jsx`
- `/src/components/Modal/confirmDialog.jsx`
- `/src/components/Modal/modal.module.css`
- `/src/components/Modal/confirmDialog.module.css`
