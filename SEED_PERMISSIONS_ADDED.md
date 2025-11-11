# ✅ Sistema de Permissões Adicionado ao Seed

## 🎯 Problema Resolvido

O usuário criado pelo script de seed não tinha permissões associadas, resultando em erro 403 (Forbidden) ao tentar realizar operações como deletar stock items.

## 🔧 Solução Implementada

### 1. Criação de Permissões (42 no total)

O script agora cria todas as permissões necessárias para o sistema:

#### Stock Management
- `stock-items:create` - Criar itens de estoque
- `stock-items:read` - Visualizar itens de estoque
- `stock-items:update` - Atualizar itens de estoque
- `stock-items:delete` - Deletar itens de estoque
- `stock-movements:create` - Criar movimentações de estoque
- `stock-movements:read` - Visualizar movimentações

#### Products & Recipes
- `products:create/read/update/delete` - CRUD de produtos
- `recipes:create/read/update/delete` - CRUD de receitas
- `ingredients:create/read/update/delete` - CRUD de ingredientes

#### Categories
- `categories:create/read/update/delete` - CRUD de categorias

#### Users & Roles
- `users:create/read/update/delete/manage` - Gerenciamento de usuários

#### Cash & Sales
- `cash:open/close/read` - Operações de caixa
- `sales:create/read` - Operações de vendas

#### Commands & Orders
- `commands:create/read/update` - Gerenciamento de comandas
- `orders:create/read/update` - Gerenciamento de pedidos

#### Reports
- `reports:read/export` - Visualização e exportação de relatórios

#### Establishment
- `establishment:read/update` - Gerenciamento do estabelecimento

### 2. Criação da Role ADMIN

- Role `ADMIN` criada com todas as 42 permissões
- Vinculada ao estabelecimento
- Marcada como role de sistema (`isSystem: true`)

### 3. Atribuição ao Usuário

O usuário `admin@saborarte.com.br` agora:
- Tem a role `ADMIN` atribuída via tabela `user_roles`
- Possui todas as 42 permissões através da role
- Pode realizar qualquer operação no sistema

## 🧪 Como Testar

1. Execute o seed:
```bash
seed-test-data.bat
```

2. Faça login:
```
Email: admin@saborarte.com.br
Senha: admin123
```

3. Teste operações que antes falhavam:
- Deletar stock items
- Criar/editar produtos
- Gerenciar ingredientes
- Todas as operações CRUD

## 📝 Estrutura de Dados

```
User (admin@saborarte.com.br)
  └─> UserRole
       └─> Role (ADMIN)
            └─> RolePermission (42 permissões)
                 └─> Permission (stock-items:delete, etc.)
```

## ✨ Benefícios

1. **Usuário Master Completo**: O usuário de teste tem acesso total ao sistema
2. **Sem Erros 403**: Todas as operações são permitidas
3. **Pronto para Testes**: Ambiente completo para testar todas as funcionalidades
4. **Idempotente**: Script pode ser executado múltiplas vezes sem erros
5. **Documentado**: Todas as permissões estão claramente definidas

## 🔄 Execução

O script agora:
1. Cria/atualiza estabelecimento (upsert)
2. Cria 42 permissões (upsert)
3. Cria role ADMIN com todas as permissões
4. Cria/atualiza usuário admin (upsert)
5. Atribui role ADMIN ao usuário
6. Cria categorias, ingredientes, receitas, produtos e stock items

## 🎉 Resultado

Usuário admin agora tem **acesso total** ao sistema com todas as permissões necessárias para testes completos!
