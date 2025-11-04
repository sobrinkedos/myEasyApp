# Arquitetura do Design System

Este documento descreve a arquitetura técnica do Restaurant Design System.

## 🏗️ Visão Geral

O Restaurant Design System é um monorepo que contém três pacotes principais, cada um com responsabilidades específicas.

```
┌─────────────────────────────────────────────────────────────┐
│                    Design System Root                        │
│                  @restaurant-system/design-system            │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌───────────┐  ┌───────────┐  ┌───────────┐
        │  Tokens   │  │    Web    │  │  Mobile   │
        │  Package  │  │  Package  │  │  Package  │
        └───────────┘  └───────────┘  └───────────┘
             │              │              │
             │              │              │
             └──────────────┴──────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  Applications │
                  │  (Consumers)  │
                  └───────────────┘
```

## 📦 Estrutura de Pacotes

### 1. @restaurant-system/tokens

**Responsabilidade**: Design tokens fundamentais

```
tokens/
├── src/
│   ├── colors.ts          # Paletas de cores
│   ├── typography.ts      # Sistema tipográfico
│   ├── spacing.ts         # Escala de espaçamento
│   ├── borderRadius.ts    # Border radius
│   ├── shadows.ts         # Elevações
│   ├── transitions.ts     # Animações
│   └── index.ts          # Exports
├── dist/                  # Build output
├── vite.config.ts        # Build config
├── tsconfig.json         # TypeScript config
└── package.json
```

**Dependências**: Nenhuma  
**Consumidores**: web, mobile

### 2. @restaurant-system/web

**Responsabilidade**: Componentes React para web

```
web/
├── src/
│   ├── components/
│   │   ├── atoms/        # Componentes básicos
│   │   ├── molecules/    # Componentes compostos
│   │   └── organisms/    # Componentes complexos
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilitários
│   ├── themes/           # Temas (light/dark)
│   └── index.ts         # Exports
├── .storybook/          # Storybook config
├── dist/                # Build output
└── package.json
```

**Dependências**: tokens, react, styled-components  
**Consumidores**: Web App, Admin Dashboard

### 3. @restaurant-system/mobile

**Responsabilidade**: Componentes React Native para mobile

```
mobile/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── hooks/
│   ├── utils/
│   └── index.ts
├── dist/
└── package.json
```

**Dependências**: tokens, react-native, styled-components  
**Consumidores**: Mobile App (Garçom)

## 🔄 Fluxo de Dependências

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Applications (Consumers)                           │
│  ├── Web App (PWA)                                  │
│  ├── Admin Dashboard                                │
│  └── Mobile App (Garçom)                            │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        │ imports
                        ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Component Libraries                                │
│  ├── @restaurant-system/web                         │
│  └── @restaurant-system/mobile                      │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        │ imports
                        ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Design Tokens                                      │
│  └── @restaurant-system/tokens                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológica

### Build & Development

```
┌──────────────┐
│   Vite       │ ──► Build tool (tokens, web)
├──────────────┤
│  TypeScript  │ ──► Type safety
├──────────────┤
│   npm        │ ──► Package manager
└──────────────┘
```

### Testing

```
┌──────────────────┐
│      Jest        │ ──► Test runner
├──────────────────┤
│ Testing Library  │ ──► Component testing
├──────────────────┤
│  jest-axe        │ ──► Accessibility testing
└──────────────────┘
```

### Quality

```
┌──────────────┐
│   ESLint     │ ──► Linting
├──────────────┤
│   Prettier   │ ──► Formatting
├──────────────┤
│  TypeScript  │ ──► Type checking
└──────────────┘
```

### Documentation

```
┌──────────────┐
│  Storybook   │ ──► Component documentation
├──────────────┤
│   Markdown   │ ──► Written documentation
└──────────────┘
```

## 🎨 Atomic Design

Os componentes seguem a metodologia Atomic Design:

```
Atoms (Átomos)
├── Button
├── Input
├── Badge
└── Icon
    │
    ▼
Molecules (Moléculas)
├── ProductCard
├── CartItem
├── SearchBar
└── FilterChip
    │
    ▼
Organisms (Organismos)
├── BottomNavigation
├── TopBar
├── ProductDetail
└── CommandaDetail
    │
    ▼
Templates (Templates)
├── MenuPage
├── CartPage
└── OrdersPage
```

## 🔧 Build Process

### Tokens Package

```
Source (TypeScript)
    │
    ▼
Vite Build
    │
    ├──► ESM (index.mjs)
    ├──► CJS (index.js)
    └──► Types (index.d.ts)
```

### Web Package

```
Source (React + TypeScript)
    │
    ▼
Vite Build
    │
    ├──► ESM (index.mjs)
    ├──► CJS (index.js)
    └──► Types (index.d.ts)
    │
    ▼
Storybook Build
    │
    └──► Static site (storybook-static/)
```

### Mobile Package

```
Source (React Native + TypeScript)
    │
    ▼
TypeScript Compiler
    │
    ├──► JavaScript (index.js)
    └──► Types (index.d.ts)
```

## 🔐 Type Safety

```
┌─────────────────────────────────────┐
│  TypeScript Strict Mode             │
│  ├── strict: true                   │
│  ├── noUnusedLocals: true           │
│  ├── noUnusedParameters: true       │
│  ├── noFallthroughCasesInSwitch     │
│  ├── noUncheckedIndexedAccess       │
│  └── noImplicitReturns: true        │
└─────────────────────────────────────┘
```

## 📊 Data Flow

### Component Usage

```
Application Code
    │
    │ import { Button } from '@restaurant-system/web'
    ▼
Web Package
    │
    │ import { colors } from '@restaurant-system/tokens'
    ▼
Tokens Package
    │
    │ export const colors = { ... }
    ▼
Rendered Component
```

### Theme System

```
ThemeProvider
    │
    ├── Light Theme
    │   ├── colors.primary
    │   ├── colors.neutral
    │   └── ...
    │
    └── Dark Theme
        ├── colors.primary (same)
        ├── colors.neutral (adjusted)
        └── ...
            │
            ▼
        Components
        (consume theme via styled-components)
```

## 🚀 Deployment

### NPM Packages

```
Local Development
    │
    │ npm run build
    ▼
Build Artifacts
    │
    │ npm publish
    ▼
NPM Registry
    │
    │ npm install
    ▼
Consumer Applications
```

### Storybook

```
Local Development
    │
    │ npm run build-storybook
    ▼
Static Site
    │
    │ Deploy to hosting
    ▼
Public Documentation
```

## 🔄 Development Workflow

```
1. Developer writes code
    │
    ▼
2. ESLint checks code quality
    │
    ▼
3. TypeScript checks types
    │
    ▼
4. Jest runs tests
    │
    ▼
5. Vite builds packages
    │
    ▼
6. Storybook generates docs
    │
    ▼
7. Ready for publish
```

## 📈 Scalability

### Horizontal Scaling

```
Current:
├── tokens
├── web
└── mobile

Future:
├── tokens
├── web
├── mobile
├── email-templates  (new)
├── icons           (new)
└── illustrations   (new)
```

### Vertical Scaling

```
Component Growth:
atoms/
├── Button
├── Input
├── Badge
└── ... (more atoms)

molecules/
├── ProductCard
├── CartItem
└── ... (more molecules)

organisms/
├── Navigation
├── ProductDetail
└── ... (more organisms)
```

## 🎯 Performance

### Bundle Size Optimization

- Tree shaking enabled
- Code splitting by component
- Lazy loading for heavy components
- Minification in production

### Runtime Performance

- Memoization (React.memo, useMemo)
- Lazy loading images
- Virtual scrolling for lists
- Optimized re-renders

## 🔒 Security

- No sensitive data in tokens
- Type safety prevents runtime errors
- ESLint security rules
- Dependency auditing

## 📚 Documentation Layers

```
1. Code Comments (JSDoc)
    │
    ▼
2. TypeScript Types
    │
    ▼
3. Storybook Stories
    │
    ▼
4. Markdown Docs
    │
    ▼
5. README files
```

## 🎉 Conclusão

Esta arquitetura fornece:
- ✅ Separação clara de responsabilidades
- ✅ Reutilização máxima de código
- ✅ Type safety em todos os níveis
- ✅ Escalabilidade horizontal e vertical
- ✅ Performance otimizada
- ✅ Documentação em múltiplas camadas
