# Checklist de Verificação do Setup

Use este checklist para verificar se o setup foi concluído corretamente.

## ✅ Estrutura de Arquivos

- [ ] Diretório `design-system/` criado
- [ ] Diretório `packages/tokens/` existe
- [ ] Diretório `packages/web/` existe
- [ ] Diretório `packages/mobile/` existe
- [ ] Arquivo `package.json` na raiz
- [ ] Arquivo `tsconfig.json` na raiz

## ✅ Configurações TypeScript

- [ ] `tsconfig.json` na raiz com strict mode
- [ ] `tsconfig.json` em cada pacote
- [ ] Configuração `strict: true`
- [ ] Configuração `noUnusedLocals: true`
- [ ] Configuração `noUnusedParameters: true`

## ✅ Build Tools (Vite)

- [ ] `vite.config.ts` em packages/tokens
- [ ] `vite.config.ts` em packages/web
- [ ] Configuração de library build
- [ ] Configuração de múltiplos formatos (ESM, CJS)
- [ ] Source maps habilitados

## ✅ Linting e Formatting

- [ ] `.eslintrc.json` na raiz
- [ ] `.eslintrc.json` em cada pacote
- [ ] `.prettierrc` configurado
- [ ] `.prettierignore` configurado
- [ ] `.editorconfig` configurado
- [ ] ESLint com TypeScript plugin
- [ ] ESLint com React plugin
- [ ] Prettier integrado com ESLint

## ✅ Testes (Jest)

- [ ] `jest.config.js` em packages/tokens
- [ ] `jest.config.js` em packages/web
- [ ] `jest.config.js` em packages/mobile
- [ ] `jest.setup.js` em packages/web
- [ ] `jest.setup.js` em packages/mobile
- [ ] Coverage threshold configurado (80%)
- [ ] React Testing Library configurado (web)
- [ ] React Native Testing Library configurado (mobile)
- [ ] Teste de exemplo criado (colors.test.ts)

## ✅ Storybook 7+

- [ ] Diretório `.storybook/` em packages/web
- [ ] `main.ts` configurado
- [ ] `preview.ts` configurado
- [ ] Addon essentials instalado
- [ ] Addon a11y instalado
- [ ] Addon interactions instalado
- [ ] Addon links instalado
- [ ] Viewports configurados (mobile, tablet, desktop)
- [ ] Story de introdução criada
- [ ] Story de exemplo criada (Colors.stories.mdx)

## ✅ Design Tokens

- [ ] `colors.ts` implementado
- [ ] `typography.ts` implementado
- [ ] `spacing.ts` implementado
- [ ] `borderRadius.ts` implementado
- [ ] `shadows.ts` implementado
- [ ] `transitions.ts` implementado
- [ ] `index.ts` exportando todos os tokens
- [ ] Paleta primária definida (laranja/vermelho)
- [ ] Paleta secundária definida (verde)
- [ ] Cores neutras definidas
- [ ] Cores de feedback definidas
- [ ] Cores de status definidas

## ✅ Documentação

- [ ] `README.md` principal
- [ ] `README.md` em packages/tokens
- [ ] `README.md` em packages/web
- [ ] `README.md` em packages/mobile
- [ ] `INSTALLATION.md` criado
- [ ] `CONTRIBUTING.md` criado
- [ ] `CHANGELOG.md` criado
- [ ] `LICENSE` criado
- [ ] `QUICK_START.md` criado
- [ ] `SETUP_COMPLETE.md` criado

## ✅ Configurações Adicionais

- [ ] `.gitignore` configurado
- [ ] `.npmrc` configurado
- [ ] `.vscode/settings.json` criado
- [ ] `.vscode/extensions.json` criado
- [ ] Workspaces npm configurados

## ✅ Package.json

### Raiz
- [ ] Nome: `@restaurant-system/design-system`
- [ ] Workspaces configurados
- [ ] Scripts: dev, build, test, lint, format, storybook
- [ ] DevDependencies: TypeScript, Prettier

### Tokens
- [ ] Nome: `@restaurant-system/tokens`
- [ ] Scripts: dev, build, test, lint
- [ ] DevDependencies: Vite, Jest, TypeScript

### Web
- [ ] Nome: `@restaurant-system/web`
- [ ] Scripts: dev, build, test, lint, storybook
- [ ] PeerDependencies: React, React DOM
- [ ] Dependencies: styled-components, tokens
- [ ] DevDependencies: Storybook, Testing Library, Vite

### Mobile
- [ ] Nome: `@restaurant-system/mobile`
- [ ] Scripts: build, test, lint
- [ ] PeerDependencies: React, React Native
- [ ] Dependencies: styled-components, tokens
- [ ] DevDependencies: Testing Library, TypeScript

## 🧪 Testes de Verificação

Execute os seguintes comandos para verificar:

```bash
# 1. Verificar estrutura
ls -la design-system/
ls -la design-system/packages/

# 2. Verificar package.json
cat design-system/package.json

# 3. Instalar dependências (após instalação)
cd design-system
npm install

# 4. Executar testes
npm test

# 5. Executar build
npm run build

# 6. Executar lint
npm run lint

# 7. Iniciar Storybook
npm run storybook
```

## ✅ Critérios de Sucesso

O setup está completo quando:

1. ✅ Todos os itens deste checklist estão marcados
2. ✅ `npm install` executa sem erros
3. ✅ `npm test` executa e todos os testes passam
4. ✅ `npm run build` executa sem erros
5. ✅ `npm run lint` não reporta erros
6. ✅ `npm run storybook` inicia e abre no navegador
7. ✅ Storybook mostra a página de introdução
8. ✅ Storybook mostra a story de cores

## 📋 Requisitos Atendidos

- [x] **Task 1**: Setup do projeto e configuração inicial
  - [x] Criar estrutura de monorepo com pacotes para web e mobile
  - [x] Configurar TypeScript com strict mode
  - [x] Configurar build tools (Vite para web, Metro para mobile)
  - [x] Configurar linting (ESLint) e formatting (Prettier)
  - [x] Configurar testes (Jest + React Testing Library)
  - [x] Configurar Storybook 7+ para documentação

- [x] **Requirements 15.1, 15.2**: Documentação e Storybook
  - [x] Storybook com componentes documentados
  - [x] Documentação de props e exemplos de código

## 🎉 Conclusão

Se todos os itens estão marcados e os testes de verificação passam, o setup está completo e pronto para desenvolvimento!
