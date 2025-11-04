# 👋 Bem-vindo ao Restaurant Design System!

Olá! Seja bem-vindo ao projeto do Design System para o sistema integrado de gestão de restaurantes. Este documento vai te guiar nos primeiros passos.

## 🎉 Você está no lugar certo!

Este é um projeto de **Design System** que fornece componentes reutilizáveis, design tokens e guidelines para criar interfaces consistentes em aplicações web e mobile.

## 🚀 Primeiros Passos (5 minutos)

### 1. Instale as Dependências

```bash
cd design-system
npm install
```

⏱️ Isso vai levar alguns minutos...

### 2. Execute os Testes

```bash
npm test
```

✅ Se tudo estiver verde, você está pronto!

### 3. Inicie o Storybook

```bash
npm run storybook
```

🎨 Seu navegador vai abrir em http://localhost:6006

### 4. Explore!

No Storybook você vai encontrar:
- 📖 Introdução ao Design System
- 🎨 Design Tokens (cores, tipografia, etc.)
- 🧩 Componentes (em breve!)

## 📚 O que Você Precisa Saber

### Estrutura do Projeto

```
design-system/
├── packages/
│   ├── tokens/      # 🎨 Cores, tipografia, espaçamentos
│   ├── web/         # ⚛️ Componentes React
│   └── mobile/      # 📱 Componentes React Native
└── docs/            # 📖 Documentação
```

### Tecnologias Principais

- **TypeScript** - Tipagem estática
- **React** - Biblioteca de componentes
- **Styled Components** - CSS-in-JS
- **Storybook** - Documentação visual
- **Jest** - Testes
- **Vite** - Build rápido

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Watch mode
npm run storybook        # Documentação visual

# Build
npm run build            # Build de tudo

# Testes
npm test                 # Executar testes
npm run test:watch       # Testes em watch mode

# Qualidade
npm run lint             # Verificar código
npm run lint:fix         # Corrigir automaticamente
npm run format           # Formatar com Prettier
```

## 🎯 Seu Primeiro Componente

Vamos criar um componente simples para você entender o fluxo:

### 1. Crie a Estrutura

```bash
mkdir -p packages/web/src/components/HelloWorld
cd packages/web/src/components/HelloWorld
```

### 2. Crie o Componente

```tsx
// HelloWorld.tsx
import { colors } from '@restaurant-system/tokens';

export const HelloWorld = () => {
  return (
    <div style={{ color: colors.primary[500] }}>
      Olá, Design System! 👋
    </div>
  );
};
```

### 3. Crie a Story

```tsx
// HelloWorld.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { HelloWorld } from './HelloWorld';

const meta: Meta<typeof HelloWorld> = {
  title: 'Components/HelloWorld',
  component: HelloWorld,
};

export default meta;
type Story = StoryObj<typeof HelloWorld>;

export const Default: Story = {};
```

### 4. Veja no Storybook

Execute `npm run storybook` e procure por "Components/HelloWorld"!

## 📖 Documentação Essencial

### Para Começar
- 📘 [QUICK_START.md](./QUICK_START.md) - Guia rápido
- 📗 [INSTALLATION.md](./INSTALLATION.md) - Instalação detalhada

### Para Desenvolver
- 📙 [CONTRIBUTING.md](./CONTRIBUTING.md) - Como contribuir
- 📕 [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura técnica

### Para Referência
- 📚 [INDEX.md](./INDEX.md) - Índice de toda documentação
- 📊 [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) - Resumo executivo

## 🎨 Design Tokens

Os design tokens são os valores fundamentais do design:

```typescript
import { colors, typography, spacing } from '@restaurant-system/tokens';

// Cores
colors.primary[500]      // #FF7A4D (laranja apetitoso)
colors.secondary[500]    // #22C55E (verde)
colors.feedback.success  // #22C55E

// Tipografia
typography.h1           // { fontSize: '36px', fontWeight: 700, ... }
typography.body         // { fontSize: '16px', fontWeight: 400, ... }

// Espaçamento
spacing[4]              // 16px
spacing[8]              // 32px
```

## 🧩 Componentes (Em Breve)

Estamos construindo uma biblioteca completa de componentes:

### Atômicos
- Button, Input, Badge, Icon, etc.

### Compostos
- ProductCard, CartItem, SearchBar, etc.

### Complexos
- Navigation, ProductDetail, CommandaDetail, etc.

## 🤝 Como Contribuir

1. **Escolha uma tarefa** - Veja [tasks.md](../.kiro/specs/restaurant-design-system/tasks.md)
2. **Crie uma branch** - `git checkout -b feature/nome-da-feature`
3. **Desenvolva** - Siga os padrões do projeto
4. **Teste** - `npm test` e `npm run lint`
5. **Documente** - Crie stories no Storybook
6. **Abra um PR** - Com descrição detalhada

Leia [CONTRIBUTING.md](./CONTRIBUTING.md) para mais detalhes!

## 💡 Dicas Importantes

### ✅ Faça

- Use TypeScript strict mode
- Siga os design tokens
- Escreva testes
- Documente no Storybook
- Mantenha componentes simples e reutilizáveis

### ❌ Evite

- Usar `any` no TypeScript
- Hardcoded colors/spacing
- Componentes muito complexos
- Código sem testes
- Commits sem mensagens claras

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**Erro ao instalar dependências**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Testes falhando**
```bash
npm test -- --clearCache
npm test
```

**Storybook não inicia**
```bash
npm run build
npm run storybook
```

### Onde Buscar Ajuda

1. 📖 Consulte a documentação (INDEX.md)
2. 🔍 Busque no Storybook
3. 💬 Abra uma issue
4. 👥 Pergunte à equipe

## 🎓 Recursos de Aprendizado

### Tecnologias

- [React](https://react.dev/) - Biblioteca de componentes
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Styled Components](https://styled-components.com/) - CSS-in-JS
- [Storybook](https://storybook.js.org/) - Documentação
- [Jest](https://jestjs.io/) - Testes

### Design System

- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Design Tokens](https://www.designtokens.org/)
- [Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

## 🎯 Próximos Passos

Agora que você já conhece o básico:

1. ✅ Explore o Storybook
2. ✅ Leia a documentação essencial
3. ✅ Crie seu primeiro componente
4. ✅ Escolha uma tarefa para trabalhar
5. ✅ Faça sua primeira contribuição!

## 🌟 Princípios do Projeto

### 1. Apetitoso e Convidativo
Cores quentes, imagens de qualidade, design que abre o apetite!

### 2. Simplicidade e Clareza
Interfaces limpas, hierarquia visual clara, ações óbvias.

### 3. Performance First
Componentes otimizados, lazy loading, feedback imediato.

### 4. Mobile-First
Design pensado primeiro para mobile, expandindo para desktop.

### 5. Acessível por Padrão
Contraste adequado, navegação por teclado, suporte a screen readers.

## 🎉 Pronto para Começar!

Você tem tudo que precisa para começar a contribuir com o Restaurant Design System!

**Comandos para começar agora:**

```bash
# 1. Instalar
npm install

# 2. Testar
npm test

# 3. Explorar
npm run storybook

# 4. Desenvolver
npm run dev
```

**Bem-vindo à equipe!** 🚀

Se tiver dúvidas, não hesite em perguntar. Estamos aqui para ajudar!

---

**Feito com ❤️ para o Restaurant System**

*Última atualização: Janeiro 2024*
