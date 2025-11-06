# 📁 CRUD de Categorias

## 🎯 Funcionalidade Implementada

Sistema completo de gerenciamento de categorias de produtos com CRUD completo.

## ✨ Funcionalidades

### 📋 Listagem de Categorias
- Tabela com todas as categorias
- Ordenação por displayOrder
- Cards com estatísticas
- Ações inline (editar, deletar, ativar/desativar)

### ➕ Criar Categoria
- Formulário simples e intuitivo
- Campos: Nome, Ordem de Exibição, Status
- Validação de dados
- Mensagens de sucesso/erro

### ✏️ Editar Categoria
- Formulário pré-preenchido
- Atualização de informações
- Validação de dados

### 🗑️ Deletar Categoria
- Confirmação antes de deletar
- Mensagem de sucesso
- Atualização automática da lista

### 🔄 Ativar/Desativar
- Toggle rápido de status
- Feedback visual imediato
- Sem necessidade de entrar no formulário

## 📊 Campos

### Nome
- **Tipo**: Texto
- **Obrigatório**: Sim
- **Exemplo**: "Bebidas", "Lanches", "Sobremesas"

### Ordem de Exibição
- **Tipo**: Número
- **Obrigatório**: Sim
- **Mínimo**: 1
- **Uso**: Define a ordem de exibição no sistema

### Status (isActive)
- **Tipo**: Boolean
- **Padrão**: true (ativa)
- **Uso**: Controla se a categoria está ativa

## 🎨 Interface

### Listagem
```
┌────────────────────────────────────────────────────────┐
│ Categorias                          [+ Nova Categoria] │
├────────────────────────────────────────────────────────┤
│ [Total: 8] [Ativas: 7] [Inativas: 1]                  │
├────────────────────────────────────────────────────────┤
│ Ordem │ Nome      │ Produtos │ Status  │ Ações        │
├────────────────────────────────────────────────────────┤
│  [1]  │ Bebidas   │ 15       │ [Ativa] │ Editar Del   │
│  [2]  │ Lanches   │ 8        │ [Ativa] │ Editar Del   │
│  [3]  │ Sobremesas│ 5        │ [Ativa] │ Editar Del   │
└────────────────────────────────────────────────────────┘
```

### Formulário
```
┌──────────────────────────────────────┐
│ Nova Categoria                       │
├──────────────────────────────────────┤
│ Nome da Categoria *                  │
│ [Bebidas                          ]  │
│                                      │
│ Ordem de Exibição *                  │
│ [1                                ]  │
│ Define a ordem de exibição           │
│                                      │
│ ☑ Categoria ativa                   │
│                                      │
│ [Cancelar]  [Cadastrar]              │
└──────────────────────────────────────┘
```

## 🔄 Fluxo de Uso

### Criar Nova Categoria
```
1. Clique em "+ Nova Categoria"
2. Preencha o nome
3. Defina a ordem de exibição
4. Marque/desmarque "Categoria ativa"
5. Clique em "Cadastrar"
```

### Editar Categoria
```
1. Na listagem, clique em "Editar"
2. Atualize as informações
3. Clique em "Atualizar"
```

### Deletar Categoria
```
1. Na listagem, clique em "Deletar"
2. Confirme a ação
3. Categoria é removida
```

### Ativar/Desativar
```
1. Na listagem, clique no badge de status
2. Status é alternado automaticamente
3. Feedback visual imediato
```

## 📊 Cards de Estatísticas

### Total de Categorias
- Quantidade total cadastrada
- Inclui ativas e inativas

### Categorias Ativas
- Quantidade de categorias ativas
- Cor verde para destaque

### Categorias Inativas
- Quantidade de categorias inativas
- Cor cinza

## 🎯 Casos de Uso

### 1. Organizar Cardápio
```
Cenário: Restaurante quer organizar produtos
Ação: Criar categorias (Bebidas, Pratos, Sobremesas)
Resultado: Produtos organizados por categoria
```

### 2. Controlar Ordem de Exibição
```
Cenário: Quer que Bebidas apareça primeiro
Ação: Definir displayOrder = 1 para Bebidas
Resultado: Bebidas aparece em primeiro lugar
```

### 3. Desativar Categoria Temporariamente
```
Cenário: Categoria não está sendo usada
Ação: Clicar no status para desativar
Resultado: Categoria inativa mas não deletada
```

### 4. Reorganizar Categorias
```
Cenário: Mudar ordem das categorias
Ação: Editar e alterar displayOrder
Resultado: Nova ordem de exibição
```

## 💾 Dados Salvos

### Criar/Atualizar
```json
{
  "name": "Bebidas",
  "displayOrder": 1,
  "isActive": true
}
```

### Resposta da API
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Bebidas",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2025-11-06T...",
    "updatedAt": "2025-11-06T...",
    "_count": {
      "products": 15
    }
  }
}
```

## 🔧 Endpoints Usados

```
GET    /api/v1/categories          - Listar todas
GET    /api/v1/categories/:id      - Buscar por ID
POST   /api/v1/categories          - Criar nova
PUT    /api/v1/categories/:id      - Atualizar
DELETE /api/v1/categories/:id      - Deletar
```

## ✨ Funcionalidades Especiais

### Ordenação Automática
- Categorias ordenadas por displayOrder
- Facilita organização visual

### Toggle de Status
- Ativar/desativar com um clique
- Sem necessidade de formulário
- Feedback imediato

### Contador de Produtos
- Mostra quantos produtos tem em cada categoria
- Ajuda a identificar categorias importantes

### Validações
- Nome obrigatório
- Ordem de exibição obrigatória
- Confirmação antes de deletar

## 🎨 Design

### Cores
- **Laranja**: Botões principais
- **Verde**: Status ativo
- **Cinza**: Status inativo
- **Azul**: Link de editar
- **Vermelho**: Link de deletar

### Badges de Status
- **Ativa**: Verde com hover
- **Inativa**: Cinza com hover
- Clicável para alternar

### Ordem de Exibição
- Badge circular laranja
- Número centralizado
- Destaque visual

## 🎉 Benefícios

### Organização
- ✅ Produtos bem organizados
- ✅ Fácil de encontrar
- ✅ Ordem personalizada

### Flexibilidade
- ✅ Criar quantas categorias precisar
- ✅ Ativar/desativar conforme necessidade
- ✅ Reorganizar facilmente

### Controle
- ✅ Vê quantos produtos por categoria
- ✅ Estatísticas rápidas
- ✅ Gestão completa

## 🚀 Próximas Melhorias (Opcional)

- [ ] Drag & drop para reordenar
- [ ] Ícones personalizados por categoria
- [ ] Cores personalizadas
- [ ] Subcategorias
- [ ] Importar/exportar categorias
- [ ] Histórico de alterações

---

**Acesse: Menu → Categorias** 🎊
