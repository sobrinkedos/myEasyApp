# 🌱 Seed de Dados de Teste

Script completo para popular o banco de dados com dados realistas para testes.

## 📦 O que será criado

### 🔐 Sistema de Permissões
- **42 permissões** cobrindo todos os recursos do sistema
- **1 role ADMIN** com todas as permissões atribuídas
- Permissões incluem:
  - Stock Items: create, read, update, delete
  - Stock Movements: create, read
  - Products, Recipes, Ingredients: CRUD completo
  - Categories: CRUD completo
  - Users: gerenciamento completo
  - Cash, Sales, Commands, Orders: operações completas
  - Reports: visualização e exportação
  - Establishment: leitura e atualização

### 🏢 Estabelecimento
- **Nome:** Restaurante Sabor & Arte
- **CNPJ:** 12.345.678/0001-90
- **Localização:** São Paulo, SP

### 👤 Usuário Administrador
- **Email:** admin@saborarte.com.br
- **Senha:** admin123
- **Role:** ADMIN (com todas as permissões)
- **Permissões:** 42 permissões incluindo:
  - Gerenciamento completo de stock items
  - Gerenciamento de produtos, receitas e ingredientes
  - Gerenciamento de usuários e roles
  - Acesso a caixa, vendas e relatórios
  - Gerenciamento de comandas e pedidos

### 📂 Categorias (4)
1. Bebidas
2. Pratos Principais
3. Sobremesas
4. Petiscos

### 🥘 Ingredientes (18)
- **Carnes:** Filé Mignon, Frango, Camarão
- **Massas e Grãos:** Arroz, Feijão, Macarrão
- **Vegetais:** Tomate, Cebola, Alho, Batata
- **Laticínios:** Queijo Mussarela, Creme de Leite, Manteiga
- **Temperos:** Azeite, Molho de Tomate
- **Sobremesas:** Chocolate, Leite Condensado, Morango

### 📖 Receitas (6)
1. **Filé Mignon ao Molho Madeira** - 30 min
2. **Frango à Parmegiana** - 45 min
3. **Camarão ao Alho e Óleo** - 20 min
4. **Macarrão ao Molho Branco** - 25 min
5. **Petit Gateau** - 20 min
6. **Mousse de Morango** - 15 min

### 🍽️ Produtos Manufaturados com Receitas (6)
1. Filé Mignon ao Molho Madeira - R$ 89,90
   - Custo: R$ 28,00 | Margem: 221%
2. Frango à Parmegiana - R$ 45,90
   - Custo: R$ 9,44 | Margem: 386%
3. Camarão ao Alho e Óleo - R$ 68,90
   - Custo: R$ 14,64 | Margem: 371%
4. Macarrão ao Molho Branco - R$ 38,90
   - Custo: R$ 4,17 | Margem: 833%
5. Petit Gateau - R$ 28,90
   - Custo: R$ 5,60 | Margem: 416%
6. Mousse de Morango - R$ 18,90 (4 porções)
   - Custo total: R$ 9,50 | Custo/porção: R$ 2,38

### 🥤 Stock Items para Revenda (6)
1. Coca-Cola 350ml - R$ 6,50 (custo: R$ 3,50)
2. Guaraná Antarctica 350ml - R$ 5,50 (custo: R$ 2,80)
3. Água Mineral 500ml - R$ 3,50 (custo: R$ 1,50)
4. Suco de Laranja Natural - R$ 8,90 (custo: R$ 4,50)
5. Cerveja Heineken Long Neck - R$ 12,90 (custo: R$ 7,50)
6. Batata Frita Porção - R$ 22,90 (custo: R$ 8,50)

## 🚀 Como Executar

### Opção 1: Usando o script batch (Windows)
```bash
seed-test-data.bat
```

### Opção 2: Manualmente
```bash
# Instalar dependência
npm install axios

# Executar seed
npx ts-node scripts/seed-test-data.ts
```

### Verificar Permissões
Após executar o seed, você pode verificar se as permissões foram aplicadas corretamente:

```bash
# Usando script batch
verify-permissions.bat

# Ou manualmente
npx ts-node scripts/verify-permissions.ts
```

Isso mostrará:
- Informações do usuário admin
- Roles atribuídas
- Todas as 42 permissões detalhadas por recurso
- Verificação de permissões críticas

## 📸 Imagens

Todas as imagens dos produtos são baixadas automaticamente do Unsplash e salvas em `uploads/products/`.

## ⚠️ Importante

- O script cria dados do zero, não verifica duplicatas
- Certifique-se de que o banco de dados está rodando
- As imagens precisam de conexão com internet para download
- O usuário criado tem senha simples (admin123) - apenas para testes!

## 🧪 Testando

Após executar o seed, você pode:

1. **Fazer login:**
   - Email: admin@saborarte.com.br
   - Senha: admin123

2. **Testar endpoints de produtos manufaturados:**
   - GET /api/v1/products - Listar produtos com receitas
   - GET /api/v1/recipes - Listar receitas
   - GET /api/v1/recipes/:id - Ver detalhes da receita com ingredientes
   - GET /api/v1/ingredients - Listar ingredientes

3. **Testar endpoints de stock items:**
   - GET /api/v1/stock-items - Listar itens de estoque para revenda
   - GET /api/v1/stock-items/:id - Ver detalhes do item

4. **Testar categorias:**
   - GET /api/v1/categories - Listar categorias

5. **Verificar imagens:**
   - Acesse: http://localhost:3000/uploads/products/file-mignon.jpg
   - E outras imagens baixadas automaticamente

## 🔄 Limpando Dados

Se quiser limpar e recriar os dados:

```bash
# Resetar banco
npx prisma migrate reset

# Executar seed novamente
seed-test-data.bat
```

## 📝 Notas

- Todos os ingredientes têm estoque inicial configurado
- Todas as receitas têm modo de preparo detalhado
- Produtos com receitas calculam custo baseado nos ingredientes
- Produtos de revenda não têm receita vinculada
