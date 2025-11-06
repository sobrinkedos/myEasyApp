# 📊 Dashboard de Estoque e Lista de Compras

## 🎯 Funcionalidades Implementadas

### 1. Cards de Estatísticas na Página Principal
Cards informativos com métricas importantes do estoque

### 2. Página de Itens com Estoque Baixo
Lista dedicada para produtos que precisam reposição

### 3. Envio por WhatsApp
Funcionalidade para enviar lista de compras formatada

## ✨ Cards de Estatísticas

### 📦 Total de Itens
- Quantidade total de produtos cadastrados
- Visão geral do catálogo

### 💰 Valor em Custo
- Soma do valor de custo de todo o estoque
- Mostra quanto foi investido
- Cor azul para destaque

### 💵 Valor em Venda
- Soma do valor de venda de todo o estoque
- Potencial de receita
- Cor verde para destaque

### ⚠️ Estoque Baixo (Clicável)
- Quantidade de itens abaixo do mínimo
- Cor laranja para alerta
- **Clicável** → Leva para página de lista de compras

## 📋 Página de Estoque Baixo

### Acesso
```
Estoque → Card "Estoque Baixo" (clique)
ou
/stock/low-stock
```

### Funcionalidades

#### 📊 Tabela de Itens
- Lista todos os produtos com estoque baixo ou zerado
- Mostra estoque atual vs mínimo
- Campos editáveis para quantidade a comprar

#### ✏️ Campos Editáveis
- **Quantidade a Comprar**: Pré-preenchida com sugestão
- Sugestão = Mínimo - Atual (ou Mínimo se maior)
- Editável para ajustar conforme necessidade

#### 💰 Cálculos Automáticos
- Subtotal por item (quantidade × preço)
- Total de itens selecionados
- Valor estimado total da compra

#### 📱 Envio por WhatsApp
- Campo opcional para número do destinatário
- Botão verde "Enviar por WhatsApp"
- Mensagem formatada profissionalmente

## 📱 Mensagem do WhatsApp

### Formato da Mensagem
```
🛒 *Lista de Compras - Estoque Baixo*

📅 Data: 06/11/2025

📦 *Itens para Comprar:*

1. *Cerveja Brahma lata 350ml*
   Quantidade: 20 un
   Estoque atual: 5 un
   Fornecedor: Ambev
   Preço ref.: R$ 3,50

2. *Coca Cola 2L*
   Quantidade: 15 un
   Estoque atual: 3 un
   Fornecedor: Coca-Cola
   Preço ref.: R$ 5,00

📊 *Resumo:*
Total de itens: 2
Valor estimado: R$ 145,00

_Enviado pelo Sistema de Gestão de Estoque_
```

### Comportamento
- **Com número**: Abre conversa direta com o número
- **Sem número**: Abre WhatsApp para escolher contato
- Mensagem já formatada e pronta para enviar

## 🎨 Design

### Cards de Estatísticas
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Itens │ Valor Custo │ Valor Venda │ Est. Baixo  │
│    150      │  R$ 15.000  │  R$ 35.000  │     12      │
│ produtos    │ investimento│ potencial   │ clique →    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Tabela de Compras
```
┌────────────────────────────────────────────────────────────┐
│ Produto    │ Atual │ Comprar │ Preço  │ Subtotal │ Forn. │
├────────────────────────────────────────────────────────────┤
│ [🖼️] Cerv. │ 5 un  │ [20]    │ R$ 3.5 │ R$ 70.00 │ Ambev │
│      Brahma│ Mín:20│         │        │          │       │
└────────────────────────────────────────────────────────────┘
```

### Seção WhatsApp
```
┌──────────────────────────────────────────────────────┐
│ Enviar Lista de Compras                              │
├──────────────────────────────────────────────────────┤
│ Número WhatsApp:  [  (00) 00000-0000  ]             │
│                                                      │
│ Total de itens: 2                                    │
│ Valor estimado: R$ 145,00                            │
│                                                      │
│ [📱 Enviar por WhatsApp]                             │
└──────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Uso

### 1. Visualizar Estatísticas
```
1. Acesse a página de Estoque
2. Veja os cards no topo
3. Identifique itens com estoque baixo
```

### 2. Acessar Lista de Compras
```
1. Clique no card "Estoque Baixo"
2. Veja lista de itens que precisam reposição
3. Quantidades já vêm sugeridas
```

### 3. Ajustar Quantidades
```
1. Revise as quantidades sugeridas
2. Ajuste conforme necessário
3. Veja subtotais atualizarem automaticamente
```

### 4. Enviar por WhatsApp
```
1. (Opcional) Digite número do destinatário
2. Clique em "Enviar por WhatsApp"
3. WhatsApp abre com mensagem pronta
4. Envie para o responsável pelas compras
```

## 💡 Casos de Uso

### 1. Controle Diário
```
Cenário: Verificar situação do estoque
Ação: Ver cards de estatísticas
Resultado: Visão rápida da saúde do estoque
```

### 2. Planejamento de Compras
```
Cenário: Precisa fazer pedido ao fornecedor
Ação: 
1. Clicar em "Estoque Baixo"
2. Revisar lista
3. Ajustar quantidades
4. Enviar por WhatsApp
```

### 3. Delegação de Compras
```
Cenário: Outra pessoa faz as compras
Ação:
1. Gerar lista de compras
2. Enviar por WhatsApp para o responsável
3. Pessoa recebe lista formatada e clara
```

### 4. Controle Financeiro
```
Cenário: Precisa saber quanto está investido
Ação: Ver card "Valor em Custo"
Resultado: Sabe exatamente quanto tem em estoque
```

## 📊 Cálculos

### Valor em Custo
```typescript
totalCost = Σ (quantidade × preço_custo)
```

### Valor em Venda
```typescript
totalSale = Σ (quantidade × preço_venda)
```

### Quantidade Sugerida
```typescript
sugerida = max(
  mínimo - atual,
  mínimo
)
```

### Subtotal Item
```typescript
subtotal = quantidade_comprar × preço_custo
```

## ✨ Funcionalidades Especiais

### Destaque Visual
- Linhas com quantidade > 0 ficam com fundo laranja
- Cards clicáveis têm hover effect
- Cores diferentes para cada métrica

### Sugestão Inteligente
- Calcula automaticamente quanto comprar
- Considera estoque atual e mínimo
- Sempre sugere pelo menos o mínimo

### WhatsApp Integrado
- Abre direto no WhatsApp Web ou App
- Mensagem profissional e formatada
- Inclui todos os detalhes necessários

## 🎯 Benefícios

### Visibilidade
- ✅ Vê situação do estoque de relance
- ✅ Identifica problemas rapidamente
- ✅ Toma decisões informadas

### Eficiência
- ✅ Lista de compras automática
- ✅ Quantidades sugeridas
- ✅ Envio rápido por WhatsApp

### Controle Financeiro
- ✅ Sabe quanto tem investido
- ✅ Conhece potencial de receita
- ✅ Planeja compras com valor estimado

### Comunicação
- ✅ Mensagem profissional
- ✅ Todas as informações necessárias
- ✅ Fácil de entender

## 🚀 Próximas Melhorias (Opcional)

- [ ] Gráficos de evolução do estoque
- [ ] Histórico de compras
- [ ] Comparação de preços entre fornecedores
- [ ] Alertas automáticos por email/SMS
- [ ] Exportar lista em PDF
- [ ] Integração com fornecedores
- [ ] Previsão de demanda

---

**Acesse: Estoque → Veja os cards → Clique em "Estoque Baixo"** 🎊
