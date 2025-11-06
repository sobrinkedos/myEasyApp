# 📦 Entrada de Estoque em Massa

## 🎯 Funcionalidade Implementada

Sistema para adicionar quantidades a múltiplos produtos de uma vez, ideal para quando você faz compras e precisa atualizar o estoque de vários itens.

## ✨ Características

### 📋 Listagem Editável
- Todos os produtos em uma tabela
- Campos editáveis inline
- Imagem miniatura do produto
- Estoque atual visível
- Cálculo automático do novo total

### 🔍 Filtros
- **Busca**: Por nome ou código
- **Categoria**: Filtrar por tipo de produto
- **Estoque Baixo**: Checkbox para mostrar apenas produtos com estoque abaixo do mínimo

### ✏️ Campos Editáveis
1. **Quantidade a Adicionar**: Quanto será adicionado ao estoque
2. **Preço de Compra**: Preço pago nesta compra (opcional)
3. **Fornecedor**: Nome do fornecedor (opcional)

### 💾 Salvamento
- Salva todas as entradas de uma vez
- Cria movimentações de estoque para cada item
- Atualiza quantidade automaticamente
- Registra histórico completo

## 🎨 Interface

### Tabela de Entrada
```
┌────────────────────────────────────────────────────────────────────────┐
│ Produto      │ Atual │ Qtd +  │ Preço    │ Fornecedor │ Novo Total    │
├────────────────────────────────────────────────────────────────────────┤
│ [🖼️] Cerveja │ 24 un │ [10]   │ [R$ 3.5] │ [Ambev]    │ 34 un (+10)  │
│      Brahma  │ Mín:5 │        │          │            │              │
├────────────────────────────────────────────────────────────────────────┤
│ [🖼️] Coca    │ 10 un │ [20]   │ [R$ 2.0] │ [Coca]     │ 30 un (+20)  │
│      Cola    │ Mín:15│        │          │            │              │
└────────────────────────────────────────────────────────────────────────┘
```

### Resumo no Rodapé
```
Total de itens a adicionar: 2
Quantidade total: 30 unidades

[Limpar]  [Salvar 2 Entrada(s)]
```

## 🔄 Fluxo de Uso

### 1. Acessar a Página
```
Estoque → Botão "📦 Entrada em Massa"
```

### 2. Filtrar Produtos (Opcional)
```
- Buscar por nome
- Filtrar por categoria
- Marcar "Apenas estoque baixo"
```

### 3. Preencher Quantidades
```
Para cada produto:
1. Digite a quantidade a adicionar
2. (Opcional) Digite o preço de compra
3. (Opcional) Digite o fornecedor
```

### 4. Revisar
```
- Linha fica destacada em laranja
- Novo total é calculado automaticamente
- Contador mostra quantos itens serão atualizados
```

### 5. Salvar
```
Clique em "Salvar X Entrada(s)"
- Cria movimentações de estoque
- Atualiza quantidades
- Registra histórico
- Mostra mensagem de sucesso
```

## 📊 Dados Salvos

### Para Cada Item
```json
{
  "stockItemId": "uuid",
  "type": "entrada",
  "quantity": 10,
  "costPrice": 3.50,
  "reason": "Compra - Ambev",
  "reference": "Entrada em massa - 06/11/2025"
}
```

### Movimentação Criada
- **Tipo**: entrada
- **Quantidade**: Valor digitado
- **Preço**: Preço de compra (se informado)
- **Motivo**: "Compra - [Fornecedor]"
- **Referência**: "Entrada em massa - [Data]"

## 🎯 Casos de Uso

### 1. Compra Semanal
```
Cenário: Você fez compras no fornecedor
Ação: 
1. Marcar "Apenas estoque baixo"
2. Adicionar quantidades compradas
3. Informar preços e fornecedor
4. Salvar tudo de uma vez
```

### 2. Reposição Urgente
```
Cenário: Vários produtos acabando
Ação:
1. Filtrar por estoque baixo
2. Ver quais precisam reposição
3. Adicionar quantidades
4. Salvar
```

### 3. Entrada de Nota Fiscal
```
Cenário: Recebeu nota fiscal com vários itens
Ação:
1. Buscar cada produto
2. Adicionar quantidade da NF
3. Informar preço da NF
4. Informar fornecedor
5. Salvar tudo
```

## ✨ Funcionalidades Especiais

### Destaque Visual
- Linhas com quantidade > 0 ficam com fundo laranja
- Novo total mostra o incremento em verde
- Contador de itens selecionados no topo

### Validações
- Quantidade deve ser maior que 0
- Preço é opcional (usa o cadastrado se não informar)
- Fornecedor é opcional

### Performance
- Salva todas as entradas em paralelo
- Atualização rápida do estoque
- Feedback visual imediato

## 🔧 Tecnicamente

### Endpoint Usado
```
POST /api/v1/stock-management/movements
```

### Dados Enviados
```typescript
{
  stockItemId: string;
  type: 'entrada';
  quantity: number;
  costPrice?: number;
  reason: string;
  reference: string;
}
```

### Atualização Automática
- Quantidade é somada ao estoque atual
- Status é recalculado automaticamente
- Histórico é registrado

## 📱 Responsividade

- Desktop: Tabela completa
- Tablet: Scroll horizontal
- Mobile: Scroll horizontal com campos menores

## 🎉 Benefícios

### Economia de Tempo
- ✅ Atualiza vários produtos de uma vez
- ✅ Não precisa entrar em cada produto
- ✅ Processo rápido e eficiente

### Controle
- ✅ Vê todos os produtos de uma vez
- ✅ Filtra por estoque baixo
- ✅ Registra fornecedor e preço

### Histórico
- ✅ Cada entrada gera movimentação
- ✅ Rastreabilidade completa
- ✅ Relatórios precisos

## 🚀 Próximas Melhorias (Opcional)

- [ ] Importar de planilha Excel
- [ ] Escanear código de barras
- [ ] Sugestão de quantidade baseada em histórico
- [ ] Cálculo de valor total da compra
- [ ] Vincular com nota fiscal
- [ ] Alertas de preço muito diferente

---

**Acesse: Estoque → 📦 Entrada em Massa** 🎊
