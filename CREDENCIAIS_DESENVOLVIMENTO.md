# 🔐 Credenciais de Desenvolvimento

## Super Administrador

**Email:** `admin@sistema.com`  
**Senha:** `05a72dafa9a05690`

⚠️ **IMPORTANTE:** Esta é uma senha gerada automaticamente para desenvolvimento. Altere após o primeiro login!

---

## 📊 Dados Criados no Seed

### Estabelecimento
- **Nome:** Estabelecimento Padrão
- **CNPJ:** 00000000000000

### Categorias (5)
1. Entradas
2. Pratos Principais
3. Bebidas
4. Sobremesas
5. Lanches

### Ingredientes (10)
- Filé Mignon (10 kg)
- Batata (20 kg)
- Alface (15 un)
- Tomate (8 kg)
- Queijo Mussarela (5 kg)
- Pão Francês (50 un)
- Óleo (10 l)
- Sal (5 kg)
- Açúcar (10 kg)
- Farinha de Trigo (15 kg)

### Receitas (3)
1. **Filé com Fritas** - Custo: R$ 22,12
2. **Hambúrguer Artesanal** - Custo: R$ 13,80
3. **Salada Caesar** - Custo: R$ 4,05

### Produtos Manufaturados (3)
1. **Filé com Fritas** - R$ 45,00
   - Usa receita "Filé com Fritas"
   - Tempo de preparo: 30 min
   
2. **Hambúrguer Artesanal** - R$ 28,00
   - Usa receita "Hambúrguer Artesanal"
   - Tempo de preparo: 15 min
   
3. **Salada Caesar** - R$ 18,00
   - Usa receita "Salada Caesar"
   - Tempo de preparo: 10 min

### Produtos de Bebidas (5)
1. **Cerveja Brahma 350ml** - R$ 8,00
2. **Coca-Cola 350ml** - R$ 6,00
3. **Água Mineral 500ml** - R$ 3,50
4. **Suco de Laranja Natural** - R$ 7,00
5. **Café Expresso** - R$ 5,00

### Produtos de Sobremesas (3)
1. **Pudim de Leite** - R$ 12,00
2. **Brownie com Sorvete** - R$ 15,00
3. **Petit Gateau** - R$ 18,00

### Itens de Estoque (4)
1. Cerveja Brahma 350ml lata (100 un)
2. Refrigerante Coca-Cola 350ml lata (80 un)
3. Água Mineral 500ml (120 un)
4. Suco Natural Laranja 300ml (40 un)

### Mesas (8)
- Mesa 1: 2 lugares
- Mesa 2: 4 lugares
- Mesa 3: 4 lugares
- Mesa 4: 6 lugares
- Mesa 5: 2 lugares
- Mesa 6: 8 lugares
- Mesa 7: 4 lugares
- Mesa 8: 4 lugares

### Caixa
- **Caixa Principal** (Número 1)

---

## 👥 Funções Criadas

1. **SUPER_ADMIN** - Acesso total ao sistema
2. **ADMIN** - Administrador do estabelecimento
3. **MANAGER** - Gerente com acesso a relatórios
4. **SUPERVISOR** - Supervisor com permissões de autorização
5. **CASH_OPERATOR** - Operador de caixa
6. **WAITER** - Garçom
7. **KITCHEN** - Cozinha
8. **TREASURER** - Tesoureiro
9. **DELIVERY** - Entregador
10. **CUSTOMER** - Cliente

---

## 🖼️ Imagens dos Produtos

Todas as imagens dos produtos são URLs do Unsplash:
- Filé com Fritas: https://images.unsplash.com/photo-1600891964092-4316c288032e
- Hambúrguer: https://images.unsplash.com/photo-1568901346375-23c9450c58cd
- Salada Caesar: https://images.unsplash.com/photo-1546793665-c74683f339c1
- Cerveja: https://images.unsplash.com/photo-1608270586620-248524c67de9
- Coca-Cola: https://images.unsplash.com/photo-1554866585-cd94860890b7
- Água: https://images.unsplash.com/photo-1548839140-29a749e1cf4d
- Suco: https://images.unsplash.com/photo-1600271886742-f049cd451bba
- Café: https://images.unsplash.com/photo-1511920170033-f8396924c348
- Pudim: https://images.unsplash.com/photo-1563805042-7684c019e1cb
- Brownie: https://images.unsplash.com/photo-1607920591413-4ec007e70023
- Petit Gateau: https://images.unsplash.com/photo-1624353365286-3f8d62daad51

---

## 🚀 Como Usar

1. Faça login com as credenciais do Super Administrador
2. Explore os produtos, receitas e ingredientes cadastrados
3. Crie pedidos de teste usando os produtos disponíveis
4. Teste o dashboard com dados reais

## 🔄 Reexecutar o Seed

Para limpar e recriar os dados:

```bash
npm run prisma:seed
```

**Nota:** O seed usa `upsert` para evitar duplicação de dados. Você pode executá-lo múltiplas vezes com segurança.
