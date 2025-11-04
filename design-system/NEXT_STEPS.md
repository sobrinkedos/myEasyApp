# Próximos Passos

Agora que o setup inicial está completo, aqui estão os próximos passos para continuar o desenvolvimento do Restaurant Design System.

## 🎯 Tarefas Imediatas

### 1. Instalar Dependências

```bash
cd design-system
npm install
```

Isso instalará todas as dependências de todos os pacotes do monorepo.

### 2. Verificar Instalação

```bash
# Executar testes
npm test

# Executar build
npm run build

# Verificar lint
npm run lint
```

### 3. Explorar o Storybook

```bash
npm run storybook
```

Acesse http://localhost:6006 e explore:
- Página de introdução
- Design tokens (cores)

## 📋 Próximas Tarefas do Roadmap

De acordo com o plano de implementação, as próximas tarefas são:

### Task 2: Implementar Design Tokens (Completo)
✅ Já implementado no setup inicial:
- Sistema de cores
- Sistema tipográfico
- Sistema de espaçamento
- Border radius, sombras e transições
- Exportação em múltiplos formatos

**Próximos sub-tasks:**
- 2.5: Adicionar exportação para CSS Variables e JSON (React Native)

### Task 3: Implementar Sistema de Grid e Layout
- 3.1: Criar breakpoints e sistema de grid
- 3.2: Criar layout patterns para diferentes viewports

### Task 4: Implementar Componentes Atômicos Base
- 4.1: Implementar componente Button
- 4.2: Implementar componentes de Input
- 4.3: Implementar componentes de seleção
- 4.4: Implementar componentes auxiliares

## 🛠️ Desenvolvimento de Componentes

### Fluxo de Trabalho Recomendado

Para cada novo componente:

1. **Criar estrutura de arquivos**
   ```
   packages/web/src/components/ComponentName/
   ├── ComponentName.tsx
   ├── ComponentName.styles.ts
   ├── ComponentName.test.tsx
   ├── ComponentName.stories.tsx
   ├── index.ts
   └── types.ts
   ```

2. **Implementar o componente**
   - Usar design tokens
   - Seguir princípios de acessibilidade
   - Implementar todas as variantes necessárias

3. **Escrever testes**
   - Testar renderização
   - Testar interações
   - Testar estados
   - Manter coverage > 80%

4. **Criar stories**
   - Documentar todas as props
   - Mostrar todas as variantes
   - Incluir exemplos de uso

5. **Executar verificações**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

## 📚 Recursos e Referências

### Documentação Interna
- `README.md` - Visão geral do projeto
- `INSTALLATION.md` - Guia de instalação detalhado
- `CONTRIBUTING.md` - Diretrizes de contribuição
- `QUICK_START.md` - Guia rápido
- `VERIFICATION_CHECKLIST.md` - Checklist de verificação

### Design System
- `design.md` - Documento de design completo
- `requirements.md` - Requisitos do sistema
- `tasks.md` - Plano de implementação

### Tecnologias
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Styled Components](https://styled-components.com/)
- [Storybook](https://storybook.js.org/)
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)

## 🎨 Implementando Task 2.5: Exportação de Tokens

### CSS Variables

Criar `packages/tokens/src/cssVariables.ts`:

```typescript
import { colors, spacing, typography } from './index';

export const generateCSSVariables = () => {
  return `
    :root {
      /* Colors */
      --color-primary-500: ${colors.primary[500]};
      --color-secondary-500: ${colors.secondary[500]};
      
      /* Spacing */
      --spacing-4: ${spacing[4]};
      
      /* Typography */
      --font-size-base: ${typography.body.fontSize};
    }
  `;
};
```

### JSON para React Native

Criar `packages/tokens/src/exportJson.ts`:

```typescript
import * as tokens from './index';
import fs from 'fs';

const json = JSON.stringify(tokens, null, 2);
fs.writeFileSync('tokens.json', json);
```

## 🚀 Começando com Task 3: Grid e Layout

### Criar Breakpoints

```typescript
// packages/tokens/src/breakpoints.ts
export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
};
```

### Criar Grid System

```typescript
// packages/web/src/components/Grid/Grid.tsx
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: ${spacing[4]};
`;
```

## 📊 Métricas de Qualidade

Mantenha estas métricas durante o desenvolvimento:

- **Test Coverage**: > 80%
- **TypeScript**: Strict mode, sem `any`
- **Lint**: Zero erros
- **Build**: Sem warnings
- **Acessibilidade**: WCAG 2.1 AA

## 🤝 Colaboração

### Antes de Começar uma Nova Feature

1. Verifique o `tasks.md` para ver a próxima tarefa
2. Leia o `design.md` para entender os requisitos
3. Consulte o `requirements.md` para requisitos específicos
4. Crie uma branch: `git checkout -b feature/nome-da-feature`

### Ao Completar uma Feature

1. Execute todos os testes
2. Verifique o lint
3. Atualize o CHANGELOG.md
4. Crie um PR com descrição detalhada
5. Aguarde code review

## 🎯 Objetivos de Curto Prazo

### Semana 1-2
- [ ] Completar Task 2.5 (exportação de tokens)
- [ ] Implementar Task 3 (Grid e Layout)
- [ ] Começar Task 4.1 (Button component)

### Semana 3-4
- [ ] Completar Task 4 (Componentes Atômicos)
- [ ] Começar Task 5 (Componentes de Produto)

### Mês 1
- [ ] Completar Tasks 1-7
- [ ] Ter biblioteca básica de componentes funcionando
- [ ] Documentação completa no Storybook

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Consulte a documentação
2. Verifique o VERIFICATION_CHECKLIST.md
3. Abra uma issue no repositório
4. Entre em contato com a equipe

---

**Boa sorte com o desenvolvimento!** 🚀

O setup está completo e você está pronto para começar a construir componentes incríveis!
