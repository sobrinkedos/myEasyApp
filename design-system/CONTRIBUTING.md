# Guia de Contribuição

Obrigado por considerar contribuir com o Restaurant Design System! Este documento fornece diretrizes para contribuir com o projeto.

## 🚀 Como Começar

1. Fork o repositório
2. Clone seu fork: `git clone https://github.com/seu-usuario/design-system.git`
3. Instale as dependências: `npm install`
4. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`

## 📝 Padrões de Código

### TypeScript

- Use TypeScript strict mode
- Evite usar `any`, prefira `unknown` quando necessário
- Defina interfaces para todas as props de componentes
- Use tipos explícitos em funções públicas

### Componentes

- Um componente por arquivo
- Use Styled Components para estilização
- Siga a estrutura de diretórios:
  ```
  ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.styles.ts
  ├── ComponentName.test.tsx
  ├── ComponentName.stories.tsx
  ├── index.ts
  └── types.ts
  ```

### Commits

Use mensagens de commit descritivas seguindo o padrão:

- `feat: adiciona novo componente Button`
- `fix: corrige problema de acessibilidade no Input`
- `docs: atualiza documentação do componente Card`
- `test: adiciona testes para ProductCard`
- `refactor: melhora performance do ImageGallery`
- `style: ajusta espaçamento no Modal`

## 🧪 Testes

- Escreva testes para todos os componentes
- Teste renderização, interações e estados
- Mantenha coverage mínimo de 80%
- Execute testes antes de fazer commit: `npm test`

## 📚 Documentação

- Adicione stories no Storybook para todos os componentes
- Documente todas as props usando JSDoc
- Inclua exemplos de uso
- Adicione notas de acessibilidade quando relevante

## 🎨 Design

- Siga os design tokens definidos
- Mantenha consistência visual
- Garanta acessibilidade (WCAG 2.1 AA)
- Teste em diferentes viewports

## ✅ Checklist de Pull Request

Antes de submeter um PR, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados e estão passando
- [ ] Documentação foi atualizada
- [ ] Stories do Storybook foram criadas
- [ ] Lint está passando (`npm run lint`)
- [ ] Build está funcionando (`npm run build`)
- [ ] CHANGELOG.md foi atualizado

## 🔍 Code Review

- Todos os PRs precisam de aprovação antes de merge
- Responda aos comentários de forma construtiva
- Faça as alterações solicitadas
- Mantenha o PR focado em uma única feature/fix

## 📞 Dúvidas?

Se tiver dúvidas, abra uma issue ou entre em contato com a equipe.

Obrigado por contribuir! 🎉
