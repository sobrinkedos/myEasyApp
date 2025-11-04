# Restaurant Design System

Sistema de design completo para o ecossistema de gestão de restaurantes, fornecendo componentes, padrões e guidelines para aplicações web e mobile.

## 📦 Pacotes

Este é um monorepo que contém os seguintes pacotes:

- **@restaurant-system/tokens**: Design tokens (cores, tipografia, espaçamentos, etc.)
- **@restaurant-system/web**: Componentes React para web
- **@restaurant-system/mobile**: Componentes React Native para mobile

## 🚀 Início Rápido

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
# Executar todos os pacotes em modo desenvolvimento
npm run dev

# Executar Storybook
npm run storybook
```

### Build

```bash
# Build de todos os pacotes
npm run build
```

### Testes

```bash
# Executar testes de todos os pacotes
npm run test
```

### Linting e Formatação

```bash
# Executar ESLint
npm run lint

# Corrigir problemas de lint automaticamente
npm run lint:fix

# Formatar código com Prettier
npm run format
```

## 📚 Documentação

A documentação completa está disponível no Storybook. Execute `npm run storybook` e acesse http://localhost:6006

## 🏗️ Estrutura do Projeto

```
design-system/
├── packages/
│   ├── tokens/          # Design tokens
│   ├── web/             # Componentes React
│   └── mobile/          # Componentes React Native
├── .storybook/          # Configuração do Storybook
├── package.json         # Configuração do monorepo
└── tsconfig.json        # Configuração TypeScript base
```

## 🎨 Princípios de Design

1. **Apetitoso e Convidativo**: Cores quentes e imagens de alta qualidade
2. **Simplicidade e Clareza**: Interfaces limpas com hierarquia visual clara
3. **Performance First**: Componentes otimizados e feedback imediato
4. **Mobile-First**: Design pensado primeiro para mobile
5. **Acessível por Padrão**: Contraste adequado e suporte a navegação por teclado

## 🛠️ Tecnologias

- **TypeScript**: Tipagem estática com strict mode
- **React 18**: Biblioteca de componentes para web
- **React Native**: Framework para mobile
- **Styled Components**: CSS-in-JS
- **Vite**: Build tool rápido
- **Jest**: Framework de testes
- **Storybook 7**: Documentação de componentes
- **ESLint + Prettier**: Linting e formatação

## 📄 Licença

MIT
