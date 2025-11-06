# CMV e Gestão de Custos - Requisitos

## Visão Geral
Sistema completo para apuração de CMV (Custo de Mercadoria Vendida), gestão de receitas e precificação inteligente de produtos preparados.

## Objetivos
- Calcular CMV com precisão usando métodos modernos (PEPS, Custo Médio Ponderado)
- Apuração periódica de estoque (diária, semanal, mensal)
- Gestão de receitas com ingredientes e porções
- Precificação automática baseada em custos e margem desejada
- Análise de rentabilidade por produto
- Controle de desperdício e perdas

## Funcionalidades Principais

### 1. Gestão de Receitas (Fichas Técnicas)
- **FR-01**: Criar receita com lista de ingredientes e quantidades
- **FR-02**: Definir rendimento da receita (quantas porções)
- **FR-03**: Calcular custo total da receita automaticamente
- **FR-04**: Calcular custo por porção
- **FR-05**: Versionar receitas (histórico de alterações)
- **FR-06**: Duplicar receitas para criar variações
- **FR-07**: Categorizar receitas (entrada, prato principal, sobremesa, bebida)

### 2. Cálculo de CMV
- **FR-08**: Método PEPS (Primeiro que Entra, Primeiro que Sai)
- **FR-09**: Método Custo Médio Ponderado (padrão)
- **FR-10**: Apuração periódica automática (diária, semanal, mensal)
- **FR-11**: Cálculo de CMV por produto
- **FR-12**: Cálculo de CMV por categoria
- **FR-13**: Cálculo de CMV total do período
- **FR-14**: Considerar perdas e desperdícios no CMV

### 3. Precificação Inteligente
- **FR-15**: Calcular preço sugerido baseado em margem de contribuição
- **FR-16**: Definir margem de lucro desejada por categoria
- **FR-17**: Considerar custos fixos e variáveis
- **FR-18**: Simular diferentes cenários de precificação
- **FR-19**: Alertas de produtos com margem abaixo do ideal
- **FR-20**: Comparar preço praticado vs preço ideal

### 4. Apuração de Estoque
- **FR-21**: Inventário periódico (contagem física)
- **FR-22**: Comparar estoque teórico vs físico
- **FR-23**: Registrar divergências e motivos
- **FR-24**: Ajustar estoque após apuração
- **FR-25**: Relatório de acuracidade de estoque
- **FR-26**: Histórico de apurações

### 5. Análise e Relatórios
- **FR-27**: Dashboard de CMV e rentabilidade
- **FR-28**: Relatório de produtos mais/menos rentáveis
- **FR-29**: Análise de variação de custos
- **FR-30**: Relatório de desperdício
- **FR-31**: Análise ABC de produtos
- **FR-32**: Exportar relatórios em PDF/Excel

## Requisitos Não Funcionais

### Performance
- **NFR-01**: Cálculo de CMV deve processar até 10.000 transações em < 5s
- **NFR-02**: Apuração periódica deve rodar em background
- **NFR-03**: Cache de cálculos de receitas

### Precisão
- **NFR-04**: Cálculos com precisão de 4 casas decimais
- **NFR-05**: Arredondamento apenas na apresentação final
- **NFR-06**: Auditoria de todos os cálculos

### Usabilidade
- **NFR-07**: Interface intuitiva para criação de receitas
- **NFR-08**: Visualização clara de custos e margens
- **NFR-09**: Alertas visuais para produtos com problemas

## Regras de Negócio

### RN-01: Cálculo de Custo Médio Ponderado
```
Custo Médio = (Estoque Anterior × Custo Anterior + Entrada × Custo Entrada) / (Estoque Anterior + Entrada)
```

### RN-02: Cálculo de CMV
```
CMV = Estoque Inicial + Compras - Estoque Final
```

### RN-03: Margem de Contribuição
```
Margem (%) = ((Preço Venda - Custo) / Preço Venda) × 100
```

### RN-04: Preço Sugerido
```
Preço Sugerido = Custo / (1 - Margem Desejada)
```

### RN-05: Markup
```
Markup = Preço Venda / Custo
```

### RN-06: Atualização de Custos
- Custos de ingredientes devem ser atualizados automaticamente
- Receitas devem recalcular custos quando ingredientes mudam
- Histórico de custos deve ser mantido

### RN-07: Apuração de Estoque
- Apuração deve ser feita fora do horário de pico
- Divergências > 5% devem gerar alerta
- Ajustes devem ser aprovados por gerente

## Modelos de Dados

### Recipe (Receita/Ficha Técnica)
```typescript
{
  id: string
  name: string
  description: string
  category: string
  yield: number // rendimento em porções
  yieldUnit: string // unidade (porções, kg, l)
  preparationTime: number // minutos
  instructions: string
  imageUrl: string
  isActive: boolean
  version: number
  ingredients: RecipeIngredient[]
  totalCost: Decimal
  costPerPortion: Decimal
  createdAt: DateTime
  updatedAt: DateTime
}
```

### RecipeIngredient
```typescript
{
  recipeId: string
  ingredientId: string
  quantity: Decimal
  unit: string
  cost: Decimal // custo no momento da criação
  notes: string
}
```

### Product (Produto Preparado)
```typescript
{
  id: string
  name: string
  description: string
  categoryId: string
  recipeId: string
  salePrice: Decimal
  suggestedPrice: Decimal
  targetMargin: Decimal // margem desejada %
  currentMargin: Decimal // margem atual %
  markup: Decimal
  imageUrl: string
  isActive: boolean
  preparationTime: number
  recipe: Recipe
  salesCount: number
  revenue: Decimal
  createdAt: DateTime
  updatedAt: DateTime
}
```

### StockAppraisal (Apuração de Estoque)
```typescript
{
  id: string
  date: DateTime
  type: 'daily' | 'weekly' | 'monthly'
  status: 'pending' | 'in_progress' | 'completed'
  userId: string
  items: StockAppraisalItem[]
  totalTheoretical: Decimal
  totalPhysical: Decimal
  totalDifference: Decimal
  accuracy: Decimal // % de acuracidade
  notes: string
  approvedBy: string
  approvedAt: DateTime
  createdAt: DateTime
  completedAt: DateTime
}
```

### StockAppraisalItem
```typescript
{
  appraisalId: string
  ingredientId: string
  theoreticalQuantity: Decimal
  physicalQuantity: Decimal
  difference: Decimal
  differencePercentage: Decimal
  unitCost: Decimal
  totalDifference: Decimal
  reason: string // motivo da divergência
  notes: string
}
```

### CMVPeriod (Período de CMV)
```typescript
{
  id: string
  startDate: DateTime
  endDate: DateTime
  type: 'daily' | 'weekly' | 'monthly'
  status: 'open' | 'closed'
  openingStock: Decimal
  purchases: Decimal
  closingStock: Decimal
  cmv: Decimal
  revenue: Decimal
  cmvPercentage: Decimal // CMV / Receita
  products: CMVProduct[]
  createdAt: DateTime
  closedAt: DateTime
}
```

### CMVProduct
```typescript
{
  periodId: string
  productId: string
  quantitySold: number
  revenue: Decimal
  cost: Decimal
  cmv: Decimal
  margin: Decimal
  marginPercentage: Decimal
}
```

## Fluxos de Trabalho

### Fluxo 1: Criar Produto com Receita
1. Criar receita (ficha técnica)
2. Adicionar ingredientes com quantidades
3. Sistema calcula custo total e por porção
4. Criar produto vinculado à receita
5. Definir margem desejada
6. Sistema sugere preço de venda
7. Ajustar preço se necessário
8. Ativar produto

### Fluxo 2: Apuração Periódica de Estoque
1. Sistema agenda apuração automática
2. Gera lista de ingredientes para contagem
3. Usuário faz contagem física
4. Sistema compara teórico vs físico
5. Identifica divergências
6. Usuário justifica divergências
7. Gerente aprova ajustes
8. Sistema atualiza estoque

### Fluxo 3: Cálculo de CMV Mensal
1. Sistema fecha período anterior
2. Coleta estoque inicial (final do período anterior)
3. Soma todas as compras do período
4. Coleta estoque final (apuração)
5. Calcula CMV = Inicial + Compras - Final
6. Distribui CMV por produto vendido
7. Calcula margens e rentabilidade
8. Gera relatórios

### Fluxo 4: Atualização de Preços
1. Custo de ingrediente é atualizado
2. Sistema recalcula custos de receitas afetadas
3. Sistema recalcula custos de produtos afetados
4. Sistema compara margem atual vs desejada
5. Gera alerta se margem < desejada
6. Sugere novo preço
7. Gerente aprova ou ajusta

## Métricas e KPIs

### KPI-01: CMV %
```
CMV % = (CMV / Receita) × 100
Ideal: 25-35% para restaurantes
```

### KPI-02: Margem de Contribuição Média
```
Margem Média = Σ(Margem × Vendas) / Total Vendas
Ideal: > 65%
```

### KPI-03: Acuracidade de Estoque
```
Acuracidade = (1 - |Teórico - Físico| / Teórico) × 100
Ideal: > 95%
```

### KPI-04: Produtos Rentáveis
```
% Produtos com Margem > Target
Ideal: > 80%
```

### KPI-05: Desperdício
```
Desperdício % = (Perdas / Compras) × 100
Ideal: < 5%
```

## Integrações

### INT-01: Ingredientes
- Buscar custos atualizados
- Verificar disponibilidade
- Atualizar estoque ao vender produto

### INT-02: Vendas
- Registrar venda de produto
- Baixar ingredientes da receita
- Calcular CMV da venda

### INT-03: Compras
- Atualizar custo médio ao receber compra
- Registrar entrada no CMV

## Segurança e Permissões

### Permissões
- `recipe.view` - Visualizar receitas
- `recipe.create` - Criar receitas
- `recipe.edit` - Editar receitas
- `recipe.delete` - Excluir receitas
- `product.view` - Visualizar produtos
- `product.create` - Criar produtos
- `product.edit` - Editar produtos
- `product.price` - Alterar preços
- `appraisal.view` - Visualizar apurações
- `appraisal.create` - Criar apurações
- `appraisal.approve` - Aprovar ajustes
- `cmv.view` - Visualizar CMV
- `cmv.close` - Fechar períodos

## Priorização

### Fase 1 (MVP)
- Gestão de receitas básica
- Cálculo de custo de receita
- CRUD de produtos preparados
- Precificação com margem

### Fase 2
- Apuração de estoque
- Cálculo de CMV básico
- Relatórios simples

### Fase 3
- CMV avançado (PEPS)
- Análise de rentabilidade
- Dashboard completo
- Alertas automáticos
