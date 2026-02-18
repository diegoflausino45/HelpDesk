# 🎨 Guia de Estilização - HelpDesk

## Visão Geral

O projeto HelpDesk foi refatorado com um **Design System moderno e escalável** baseado em variáveis CSS e componentes reutilizáveis.

## Arquitetura de CSS

```
src/styles/
├── global.module.css      # Estilos globais e reset
├── theme.css              # Design tokens (cores, espaçamento, tipografia)
└── components.css         # Componentes CSS reutilizáveis
```

## Design Tokens

### Cores

#### Primárias
```css
--color-primary: #c62828           /* Vermelho principal */
--color-primary-dark: #b71c1c      /* Vermelho escuro */
--color-primary-darker: #c1121f    /* Vermelho mais escuro */
--color-primary-light: #e53935     /* Vermelho claro */
```

#### Status de Chamados
```css
--color-status-open: #c62828              /* Aberto */
--color-status-open-bg: #fdecea
--color-status-progress: #f9a825          /* Em andamento */
--color-status-progress-bg: #fff8e1
--color-status-resolved: #2e7d32          /* Resolvido */
--color-status-resolved-bg: #e8f5e9
```

#### Prioridades
```css
--color-priority-high: #c62828            /* Alta */
--color-priority-high-bg: #fdecea
--color-priority-medium: #f9a825          /* Média */
--color-priority-medium-bg: #fff8e1
--color-priority-low: #2e7d32             /* Baixa */
--color-priority-low-bg: #e8f5e9
```

#### Neutras
```css
--color-text-primary: #333
--color-text-secondary: #666
--color-text-tertiary: #999
--color-text-disabled: #ccc
--color-text-white: #fff

--color-bg-primary: #fff
--color-bg-secondary: #f5f5f5
--color-bg-tertiary: #fafafa
--color-bg-light: #f6f7fb

--color-border: #ddd
--color-border-light: #eee

--color-error: #d32f2f
--color-error-bg: #ffebee
```

### Espaçamento

Sistema baseado em unidades de 0.25rem:

```css
--space-xs: 0.25rem      /* 4px */
--space-sm: 0.5rem       /* 8px */
--space-md: 0.75rem      /* 12px */
--space-lg: 1rem         /* 16px */
--space-xl: 1.5rem       /* 24px */
--space-2xl: 2rem        /* 32px */
--space-3xl: 3rem        /* 48px */
--space-4xl: 4rem        /* 64px */
```

### Tipografia

#### Tamanhos
```css
--font-size-xs: 0.75rem      /* 12px */
--font-size-sm: 0.85rem      /* 13px */
--font-size-base: 1rem       /* 16px */
--font-size-lg: 1.125rem     /* 18px */
--font-size-xl: 1.25rem      /* 20px */
--font-size-2xl: 1.5rem      /* 24px */
--font-size-3xl: 1.8rem      /* 28.8px */
--font-size-4xl: 2rem        /* 32px */
```

#### Pesos
```css
--font-weight-light: 300
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

#### Altura de linha
```css
--line-height-tight: 1.2      /* Títulos */
--line-height-normal: 1.5     /* Padrão */
--line-height-relaxed: 1.75   /* Corpo */
```

### Border Radius

```css
--radius-sm: 4px
--radius-md: 6px
--radius-lg: 8px
--radius-xl: 10px
--radius-2xl: 12px
--radius-full: 9999px
```

### Sombras

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08)
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 4px 15px rgba(0, 0, 0, 0.1)     /* Padrão */
--shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.15)
```

### Transições

```css
--transition-fast: 0.15s ease
--transition-base: 0.2s ease               /* Padrão */
--transition-slow: 0.3s ease
--transition-slower: 0.35s cubic-bezier(0.4, 0, 0.2, 1)
```

### Z-Index

```css
--z-dropdown: 100      /* Dropdowns */
--z-sticky: 500        /* Sticky/Fixed (Nav) */
--z-fixed: 900         /* Header fixo */
--z-modal: 999         /* Modais */
```

## Componentes CSS

### Botões

```html
<!-- Primary -->
<button class="btn btn-primary">Salvar</button>

<!-- Secondary -->
<button class="btn btn-secondary">Cancelar</button>

<!-- Ghost -->
<button class="btn btn-ghost">Link</button>

<!-- Tamanhos -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>

<!-- Desabilitado -->
<button class="btn btn-primary" disabled>Desabilitado</button>
```

### Cards

```html
<!-- Card padrão -->
<div class="card">
  <h3>Título</h3>
  <p>Conteúdo do card</p>
</div>

<!-- Card compacto -->
<div class="card card-compact">
  <p>Conteúdo compacto</p>
</div>
```

### Inputs

```html
<!-- Input padrão -->
<input type="text" class="input" placeholder="Digitar..." />

<!-- Input com erro -->
<input type="text" class="input input-error" />

<!-- Select -->
<select class="input">
  <option>Opção 1</option>
  <option>Opção 2</option>
</select>

<!-- Textarea -->
<textarea class="input" rows="4"></textarea>
```

### Badges

```html
<!-- Status -->
<span class="badge badge-open">Aberto</span>
<span class="badge badge-progress">Em andamento</span>
<span class="badge badge-resolved">Resolvido</span>

<!-- Prioridades -->
<span class="badge badge-high">Alta</span>
<span class="badge badge-medium">Média</span>
<span class="badge badge-low">Baixa</span>

<!-- Perfis -->
<span class="badge badge-admin">Admin</span>
<span class="badge badge-tecnico">Técnico</span>
<span class="badge badge-usuario">Usuário</span>

<!-- Status de usuários -->
<span class="badge badge-ativo">Ativo</span>
<span class="badge badge-inativo">Inativo</span>
```

### Formulários

```html
<form>
  <div class="form-group">
    <label class="form-label required">Nome</label>
    <input type="text" class="input" />
    <span class="form-error">Nome é obrigatório</span>
  </div>

  <div class="form-group">
    <label class="form-label">Descrição (máximo 500 caracteres)</label>
    <textarea class="input" maxlength="500"></textarea>
    <span class="char-count">0/500</span>
  </div>
</form>
```

### Layouts

```html
<!-- Flex -->
<div class="flex gap-lg">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Flex coluna -->
<div class="flex-col gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Flex centralizado -->
<div class="flex-center">
  <p>Conteúdo centralizado</p>
</div>
```

### Espaçamento

```html
<!-- Padding -->
<div class="p-lg">Padding grande</div>

<!-- Margin -->
<div class="m-xl">Margin extra grande</div>

<!-- Margin bottom específico -->
<div class="mb-lg">Margem inferior grande</div>
```

### Textos

```html
<!-- Tamanhos -->
<p class="text-xs">Extra pequeno</p>
<p class="text-sm">Pequeno</p>
<p class="text-base">Padrão</p>
<p class="text-lg">Grande</p>

<!-- Cores -->
<p class="text-primary">Texto primário</p>
<p class="text-secondary">Texto secundário</p>
<p class="text-error">Texto de erro</p>

<!-- Pesos -->
<p class="text-semibold">Semi-ousado</p>
<p class="text-bold">Ousado</p>

<!-- Alinhamento -->
<p class="text-center">Centralizado</p>

<!-- Truncate -->
<p class="truncate">Texto muito longo que será cortado...</p>
```

## Usando Variáveis CSS em Módulos

Todos os arquivos `.module.css` têm acesso às variáveis de tema:

```css
.card {
  background-color: var(--color-bg-primary);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}
```

## Breakpoints Responsivos

```css
@media (max-width: 1280px) {
  /* Extra large */
}

@media (max-width: 1024px) {
  /* Large */
}

@media (max-width: 768px) {
  /* Medium (tablet) */
}

@media (max-width: 480px) {
  /* Small (mobile) */
}

@media (max-width: 360px) {
  /* Extra small */
}
```

### Exemplo de Responsive

```css
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
}

@media (max-width: 1024px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
}
```

## Boas Práticas

### ✅ Faça

1. **Use variáveis CSS** em vez de valores hardcoded
   ```css
   color: var(--color-primary);      /* ✅ Bom */
   color: #c62828;                    /* ❌ Evitar */
   ```

2. **Reutilize componentes CSS**
   ```html
   <button class="btn btn-primary">Salvar</button>  <!-- ✅ Bom -->
   ```

3. **Use espaçamento consistente**
   ```css
   padding: var(--space-lg);          /* ✅ Bom */
   padding: 20px;                     /* ❌ Evitar */
   ```

4. **Mantenha componentes módulares**
   - Um arquivo `.module.css` por componente
   - Use classes descritivas e específicas

5. **Implemente responsive design**
   - Design mobile-first
   - Use media queries para telas maiores

### ❌ Evite

1. **Hardcoded colors e valores**
2. **Estilos inline quando possível**
3. **Seletores muito específicos** (evita reusabilidade)
4. **CSS duplicado** entre arquivos
5. **Quebrar responsive design**

## Adicionar Nova Cor ao Tema

Se precisar adicionar uma nova cor ao tema, edite `src/styles/theme.css`:

```css
:root {
  /* Adicione aqui */
  --color-custom-primary: #xyz;
  --color-custom-secondary: #abc;
}
```

Depois use assim:

```css
.myElement {
  color: var(--color-custom-primary);
}
```

## Adicionar Nova Classe Utilitária

Se precisar de uma nova classe utilitária, adicione em `src/styles/components.css`:

```css
.my-utility {
  /* seu código */
}
```

## Migrando de Hardcoded Styles

Se encontrar estilos hardcoded em arquivos `.module.css` existentes:

1. **Antes:**
   ```css
   .button {
     background-color: #c62828;
     padding: 0.5em 1em;
     border-radius: 6px;
   }
   ```

2. **Depois:**
   ```css
   .button {
     background-color: var(--color-primary);
     padding: var(--space-md) var(--space-lg);
     border-radius: var(--radius-md);
   }
   ```

## Suporte a Modo Escuro

O tema suporta preferência de modo escuro do sistema:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #f5f5f5;
    --color-bg-primary: #1e1e1e;
    /* etc */
  }
}
```

Isso é detectado automaticamente pelo navegador e aplicado sem mudanças de código.

## Troubleshooting

### Variáveis CSS não funcionam
- Certifique-se que `src/styles/global.module.css` está importado em `src/main.jsx`
- Verifique se o arquivo está nomeado corretamente: `theme.css`

### Cores não correspondem
- Verifique o valor da variável em `src/styles/theme.css`
- Use `--color-primary` em vez de valores hardcoded

### Responsive design não funciona
- Adicione media queries em seus componentes
- Teste com DevTools (F12 > Device Toolbar)

## Recursos Úteis

- [CSS Variables (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
