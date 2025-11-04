# Guia de Instalação

Este guia fornece instruções detalhadas para configurar o ambiente de desenvolvimento do Restaurant Design System.

## Pré-requisitos

Certifique-se de ter instalado:

- **Node.js**: >= 20.0.0
- **npm**: >= 10.0.0

Verifique as versões instaladas:

```bash
node --version
npm --version
```

## Instalação

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd design-system
```

### 2. Instale as Dependências

O projeto usa npm workspaces para gerenciar o monorepo. Execute:

```bash
npm install
```

Este comando instalará todas as dependências de todos os pacotes.

### 3. Verifique a Instalação

Execute os testes para verificar se tudo está funcionando:

```bash
npm test
```

Execute o build:

```bash
npm run build
```

### 4. Inicie o Storybook

Para visualizar os componentes:

```bash
npm run storybook
```

O Storybook será aberto em http://localhost:6006

## Estrutura de Pacotes

Após a instalação, você terá a seguinte estrutura:

```
design-system/
├── packages/
│   ├── tokens/          # Design tokens
│   │   ├── src/
│   │   ├── dist/        # Gerado após build
│   │   └── package.json
│   ├── web/             # Componentes React
│   │   ├── src/
│   │   ├── dist/        # Gerado após build
│   │   └── package.json
│   └── mobile/          # Componentes React Native
│       ├── src/
│       ├── dist/        # Gerado após build
│       └── package.json
└── node_modules/        # Dependências
```

## Scripts Disponíveis

### Desenvolvimento

```bash
# Executar todos os pacotes em modo watch
npm run dev

# Executar Storybook
npm run storybook
```

### Build

```bash
# Build de todos os pacotes
npm run build

# Build do Storybook
npm run build-storybook
```

### Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

### Linting e Formatação

```bash
# Verificar problemas de lint
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix

# Formatar código
npm run format
```

## Trabalhando com Pacotes Individuais

Para executar comandos em um pacote específico:

```bash
# Executar comando no pacote tokens
npm run build -w @restaurant-system/tokens

# Executar testes no pacote web
npm test -w @restaurant-system/web

# Executar Storybook
npm run storybook -w @restaurant-system/web
```

## Solução de Problemas

### Erro de versão do Node

Se você receber um erro sobre a versão do Node, certifique-se de estar usando Node >= 20.0.0:

```bash
node --version
```

### Problemas com dependências

Se houver problemas com dependências, tente:

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problemas com build

Se o build falhar, tente:

```bash
# Limpar builds anteriores
npm run clean

# Rebuild
npm run build
```

## Próximos Passos

Após a instalação bem-sucedida:

1. Leia o [README.md](./README.md) para entender a estrutura do projeto
2. Consulte o [CONTRIBUTING.md](./CONTRIBUTING.md) para diretrizes de contribuição
3. Explore o Storybook para ver os componentes disponíveis
4. Comece a desenvolver novos componentes!

## Suporte

Se encontrar problemas durante a instalação, abra uma issue no repositório do projeto.
