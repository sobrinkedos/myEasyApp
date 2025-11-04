# Quick Start Guide

Guia rápido para começar a trabalhar com o Restaurant Design System.

## 🚀 Instalação Rápida

```bash
# 1. Navegar para o diretório
cd design-system

# 2. Instalar dependências
npm install

# 3. Verificar instalação
npm test

# 4. Iniciar Storybook
npm run storybook
```

## 📦 Comandos Principais

```bash
# Desenvolvimento
npm run dev              # Watch mode para todos os pacotes
npm run storybook        # Abrir Storybook (localhost:6006)

# Build
npm run build            # Build de todos os pacotes
npm run build-storybook  # Build do Storybook

# Testes
npm test                 # Executar todos os testes
npm run test:watch       # Testes em watch mode

# Qualidade de Código
npm run lint             # Verificar problemas
npm run lint:fix         # Corrigir automaticamente
npm run format           # Formatar com Prettier
```

## 🎨 Usando Design Tokens

```typescript
// Importar tokens
import { colors, typography, spacing } from '@restaurant-system/tokens';

// Usar cores
const primaryColor = colors.primary[500];     // #FF7A4D
const successColor = colors.feedback.success; // #22C55E

// Usar tipografia
const heading = typography.h1;
// { fontSize: '36px', fontWeight: 700, lineHeight: 1.2 }

// Usar espaçamento
const padding = spacing[4]; // 16px
```

## 🧩 Criando um Componente

### 1. Estrutura de Arquivos

```
packages/web/src/components/Button/
├── Button.tsx           # Componente
├── Button.styles.ts     # Estilos
├── Button.test.tsx      # Testes
├── Button.stories.tsx   # Storybook
├── index.ts            # Export
└── types.ts            # Types
```

### 2. Exemplo de Componente

```tsx
// Button.tsx
import { ButtonProps } from './types';
import { StyledButton } from './Button.styles';

export const Button = ({ variant = 'primary', size = 'medium', children, ...props }: ButtonProps) => {
  return (
    <StyledButton $variant={variant} $size={size} {...props}>
      {children}
    </StyledButton>
  );
};
```

### 3. Exemplo de Estilos

```tsx
// Button.styles.ts
import styled from 'styled-components';
import { colors, spacing } from '@restaurant-system/tokens';

export const StyledButton = styled.button<{ $variant: string; $size: string }>`
  background-color: ${({ $variant }) => 
    $variant === 'primary' ? colors.primary[500] : colors.secondary[500]
  };
  padding: ${spacing[4]};
  border-radius: 8px;
  border: none;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;
```

### 4. Exemplo de Story

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Atoms/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};
```

### 5. Exemplo de Teste

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 📚 Recursos

- **Storybook**: http://localhost:6006 (após `npm run storybook`)
- **Documentação**: Veja os arquivos README.md em cada pacote
- **Contribuição**: Leia CONTRIBUTING.md
- **Instalação Detalhada**: Veja INSTALLATION.md

## 🆘 Problemas Comuns

### Erro de versão do Node
```bash
# Verificar versão
node --version  # Deve ser >= 20.0.0
```

### Dependências não instaladas
```bash
# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Build falhando
```bash
# Limpar e rebuildar
npm run clean
npm run build
```

## 📞 Suporte

- Abra uma issue no repositório
- Consulte a documentação completa
- Entre em contato com a equipe

---

**Pronto para começar!** 🎉

Execute `npm run storybook` e comece a explorar os componentes.
