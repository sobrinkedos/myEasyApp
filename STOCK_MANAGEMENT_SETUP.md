# 🏪 Setup - Sistema de Gestão de Estoque

## 📋 Execute estes comandos

### 1. Gerar Prisma Client
```bash
npm run prisma:generate
```

### 2. Criar Migration
```bash
npx prisma migrate dev --name add_stock_items
```

### 3. Reiniciar Backend
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## 🎯 O que foi criado

### Novos Models no Prisma

#### StockItem (Itens de Estoque)
- **Identificação:** nome, descrição, código de barras, SKU
- **Categorização:** categoria, fornecedor, localização
- **Quantidades:** atual, mínima, máxima
- **Precificação:** preço de custo, preço de venda
- **Controle:** data de validade, status, ativo/inativo
- **Multi-tenant:** vinculado ao estabelecimento

#### StockMovement (Movimentações)
- **Tipo:** entrada, saída, ajuste, perda, devolução
- **Quantidade:** quantidade movimentada
- **Valores:** preço de custo, custo total
- **Rastreabilidade:** motivo, referência, usuário, data

---

## 📊 Funcionalidades do Sistema

### 1. Gestão de Itens
- ✅ Cadastro completo de produtos
- ✅ Código de barras e SKU
- ✅ Categorização (Bebidas, Salgadinhos, etc)
- ✅ Controle de validade
- ✅ Localização no estoque
- ✅ Fornecedores

### 2. Controle de Estoque
- ✅ Entrada de mercadorias
- ✅ Saída de mercadorias
- ✅ Ajustes de estoque
- ✅ Registro de perdas
- ✅ Devoluções

### 3. Precificação
- ✅ Preço de custo
- ✅ Preço de venda
- ✅ Margem de lucro
- ✅ Histórico de preços

### 4. Alertas
- ✅ Estoque baixo
- ✅ Estoque zerado
- ✅ Produtos vencendo
- ✅ Produtos vencidos

### 5. Relatórios
- ✅ Valor total do estoque
- ✅ Itens mais vendidos
- ✅ Itens com baixa rotatividade
- ✅ Histórico de movimentações
- ✅ Lucro por produto

---

## 🗂️ Categorias Sugeridas

- **Bebidas Alcoólicas** - Cervejas, vinhos, destilados
- **Bebidas Não Alcoólicas** - Refrigerantes, sucos, água
- **Salgadinhos** - Chips, biscoitos salgados
- **Doces** - Chocolates, balas, biscoitos doces
- **Congelados** - Sorvetes, picolés
- **Outros** - Diversos

---

## 📦 Unidades de Medida

- **un** - Unidade
- **cx** - Caixa
- **pct** - Pacote
- **kg** - Quilograma
- **l** - Litro
- **ml** - Mililitro

---

## 🔄 Tipos de Movimentação

- **entrada** - Compra de mercadorias
- **saida** - Venda de mercadorias
- **ajuste** - Ajuste de inventário
- **perda** - Perda/quebra de produtos
- **devolucao** - Devolução ao fornecedor
- **transferencia** - Transferência entre locais

---

## 📊 Status do Item

- **normal** - Estoque normal
- **baixo** - Estoque abaixo do mínimo
- **zerado** - Estoque zerado
- **vencendo** - Produto próximo do vencimento
- **vencido** - Produto vencido

---

## 🎨 Interface do Sistema

### Tela Principal
- Lista de itens com filtros
- Indicadores visuais de status
- Busca por nome, código de barras, SKU
- Filtros por categoria, status

### Cadastro de Item
- Formulário completo
- Upload de foto do produto
- Cálculo automático de margem

### Movimentação
- Seleção de item
- Tipo de movimentação
- Quantidade
- Preço (se aplicável)
- Motivo/Observação

### Dashboard
- Cards com totais
- Gráficos de movimentação
- Lista de alertas
- Produtos mais vendidos

---

## 🚀 Próximos Passos

Após executar os comandos acima, o sistema estará pronto para:

1. ✅ Backend completo (models, repositories, services, controllers)
2. ✅ Frontend completo (páginas, componentes, formulários)
3. ✅ Relatórios e dashboards
4. ✅ Sistema de alertas

---

**Execute os comandos e me avise quando estiver pronto para continuar!** 🎯
