# Sistema de Validações - HelpDesk

## 📋 Visão Geral

Este projeto implementa um sistema completo de validações para garantir qualidade dos dados em toda a aplicação. As validações são executadas no lado do cliente antes do envio de dados.

## 🚀 Como Usar

### 1. Validações de Formulários

#### Importar funções de validação:

```javascript
import {
  validateRequired,
  validateEmail,
  validateNomeUsuario,
  validateTituloChamado,
  validateDescricao,
} from "../../utils/validations"
```

#### Usar em um componente:

```javascript
const [form, setForm] = useState({ titulo: "" })
const [erros, setErros] = useState({})

function handleSubmit(e) {
  e.preventDefault()
  
  // Validar
  const errosValidacao = {}
  
  const validacao = validateTituloChamado(form.titulo)
  if (!validacao.isValid) {
    errosValidacao.titulo = validacao.error
  }
  
  setErros(errosValidacao)
  
  if (Object.keys(errosValidacao).length > 0) return
  
  // Enviar dados...
}
```

### 2. Componentes de Input com Validação Integrada

Para simplificar, use os componentes que já possuem validação visual integrada:

```javascript
import { ValidatedInput, ValidatedSelect, ValidatedTextarea } from "../../components/ValidatedInput/validatedInput"

// Exemplo:
<ValidatedInput
  label="Título do Chamado"
  name="titulo"
  value={form.titulo}
  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
  error={erros.titulo}
  maxLength={100}
  required
  placeholder="Digite o título..."
/>

<ValidatedSelect
  label="Prioridade"
  name="prioridade"
  value={form.prioridade}
  onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
  error={erros.prioridade}
  options={[
    { value: "Alta", label: "Alta" },
    { value: "Média", label: "Média" },
    { value: "Baixa", label: "Baixa" },
  ]}
  required
/>

<ValidatedTextarea
  label="Descrição"
  name="descricao"
  value={form.descricao}
  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
  error={erros.descricao}
  maxLength={5000}
  required
  rows={5}
/>
```

## 📝 Funções de Validação Disponíveis

### Validações Básicas

- **`validateRequired(value, fieldName)`** - Valida campo obrigatório
- **`validateMinLength(value, minLength, fieldName)`** - Valida comprimento mínimo
- **`validateMaxLength(value, maxLength, fieldName)`** - Valida comprimento máximo
- **`validateEmail(email)`** - Valida formato de email
- **`validateNumber(value, fieldName)`** - Valida se é número

### Validações Específicas do Projeto

- **`validateTituloChamado(titulo)`** - Valida título (5-100 caracteres)
- **`validateDescricao(descricao)`** - Valida descrição (10-5000 caracteres)
- **`validateNomeUsuario(nome)`** - Valida nome de usuário (3-100 caracteres, apenas letras)
- **`validateSetor(setor)`** - Valida se setor foi preenchido
- **`validateLength(value, min, max, fieldName)`** - Validação combinada de comprimento

### Utilitários

- **`sanitizeInput(value)`** - Remove espaços extras de um valor
- **`validateForm(data, rules)`** - Valida múltiplos campos de uma vez

## 📊 Exemplo de Validação Complexa

```javascript
import { validateForm } from "../../utils/validations"

const rules = {
  nome: [(value) => validateNomeUsuario(value)],
  email: [(value) => validateEmail(value)],
  setor: [(value) => validateSetor(value)]
}

const { isValid, errors } = validateForm(form, rules)

if (!isValid) {
  setErros(errors)
  return
}
```

## ✅ Validações Implementadas

### Modal de Criar Chamado
- ✅ Título obrigatório com 5-100 caracteres
- ✅ Descrição obrigatória com 10-5000 caracteres
- ✅ Categoria obrigatória
- ✅ Feedback visual de erros
- ✅ Contador de caracteres

### Modal de Criar Usuário
- ✅ Nome obrigatório com 3-100 caracteres (apenas letras)
- ✅ Email obrigatório e válido
- ✅ Setor obrigatório
- ✅ Limpeza automática de erros ao digitar
- ✅ Feedback visual

### Modal de Editar Usuário
- ✅ Mesmas validações do criar
- ✅ Validação sob demanda (após submit)

### Filtros
- ✅ Limite máximo de 100 caracteres em buscas
- ✅ Valores padrão corretos em selects
- ✅ Trim automático de espaços em buscas

## 🎨 Estilos de Validação

Os estilos foram aplicados aos arquivos CSS:
- `.formGroup` - Container do campo
- `.inputError` - Input com erro (borda vermelha, fundo claro)
- `.error` - Mensagem de erro (vermelho)
- `.charCount` - Contador de caracteres (cinza)
- `.required` - Indicador de campo obrigatório

## 🔒 Constantes de Validação

Você pode usar constantes predefinidas em `src/utils/constants.js`:

```javascript
import { VALIDATION_RULES, STATUS_CHAMADO, PRIORIDADE_CHAMADO } from "../../utils/constants"

// Usar regras
const { TITULO_CHAMADO } = VALIDATION_RULES
const maxLength = TITULO_CHAMADO.maxLength // 100

// Usar constantes
const status = STATUS_CHAMADO.ABERTO // "Aberto"
const prioridade = PRIORIDADE_CHAMADO.ALTA // "Alta"
```

## 📱 Acessibilidade

Todos os componentes validados incluem:
- Atributos `aria-invalid` para indicar erros
- Atributos `aria-describedby` vinculando erros ao campo
- Labels associados aos inputs
- Indicadores visuais e textuais de erros

## ⚡ Melhorias Futuras

- [ ] Validação em tempo real (debounce)
- [ ] Integração com API para validar email duplicado
- [ ] Validação customizada por usuário
- [ ] Mensagens de erro multilíngues
- [ ] Toast notifications para feedback
- [ ] Integração com Zod ou Yup para validações mais complexas

---

**Última atualização:** 14 de fevereiro de 2026
