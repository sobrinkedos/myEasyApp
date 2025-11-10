# Proposta: Consolidação de Estoque (Insumos + Revenda)

## Problema Identificado

Atualmente temos dois tipos de itens no sistema:

1. **Ingredient** (Insumos) - Ingredientes para manipulação/produção de pratos
2. **StockItem** (Estoque) - Itens para revenda direta

**Desafios**:
- Não há visão consolidada do estoque total
- Conferência de estoque não inclui StockItems
- CMV não considera itens de revenda
- Relatórios fragmentados

---

## Solução Proposta

### Abordagem: Consolidação Virtual

Manter a separação lógica dos modelos (Ingredient e StockItem) mas criar uma camada de consolidação para:
- Conferência de estoque unificada
- Cálculo de CMV consolidado
- Relatórios integrados

**Vantagens**:
- ✅ Não quebra funcionalidades existentes
- ✅ Mantém a separação conceitual (insumos vs revenda)
- ✅ Permite visão consolidada quando necessário
- ✅ Facilita relatórios e análises

---

## Mudanças no Schema

### 1. Atualizar StockAppraisalItem

Permitir que um item de conferência seja tanto Ingredient quanto StockItem:

```prisma
model StockAppraisalItem {
  appraisalId          String
  
  // Tornar ingredientId opcional
  ingredientId         String?
  
  // Adicionar stockItemId opcional
  stockItemId          String?
  
  // Adicionar tipo para identificação
  itemType             String  // 'ingredient' ou 'stock_item'
  
  // Campos existentes
  theoreticalQuantity  Decimal  @db.Decimal(10, 3)
  physicalQuantity     Decimal? @db.Decimal(10, 3)
  difference           Decimal? @db.Decimal(10, 3)
  differencePercentage Decimal? @db.Decimal(5, 2)
  unitCost             Decimal  @db.Decimal(10, 4)
  totalDifference      Decimal? @db.Decimal(10, 2)
  reason               String?
  notes                String?

  appraisal  StockAppraisal @relation(fields: [appraisalId], references: [id], onDelete: Cascade)
  ingredient Ingredient?    @relation(fields: [ingredientId], references: [id])
  stockItem  StockItem?     @relation(fields: [stockItemId], references: [id])

  @@id([appraisalId, itemType, ingredientId, stockItemId])
  @@index([appraisalId])
  @@index([ingredientId])
  @@index([stockItemId])
  @@map("stock_appraisal_items")
}
```

**Constraint**: Exatamente um de `ingredientId` ou `stockItemId` deve estar preenchido.

---

## Mudanças na API

### 1. Novo Endpoint: Listar Todos os Itens de Estoque

```typescript
GET /api/v1/stock/consolidated
```

**Response**:
```json
{
  "ingredients": [
    {
      "id": "uuid",
      "type": "ingredient",
      "name": "Farinha de Trigo",
      "currentQuantity": 50.5,
      "unit": "kg",
      "averageCost": 8.50,
      "totalValue": 429.25,
      "status": "normal"
    }
  ],
  "stockItems": [
    {
      "id": "uuid",
      "type": "stock_item",
      "name": "Coca-Cola 2L",
      "currentQuantity": 24,
      "unit": "un",
      "costPrice": 6.50,
      "totalValue": 156.00,
      "status": "normal"
    }
  ],
  "summary": {
    "totalIngredients": 150,
    "totalStockItems": 80,
    "totalValue": 15420.50,
    "ingredientsValue": 12350.00,
    "stockItemsValue": 3070.50
  }
}
```

### 2. Atualizar Endpoint: Criar Conferência

```typescript
POST /api/v1/appraisals
```

**Request**:
```json
{
  "date": "2025-11-10T10:00:00Z",
  "type": "monthly",
  "includeIngredients": true,
  "includeStockItems": true,
  "notes": "Conferência mensal completa"
}
```

**Comportamento**:
- Se `includeIngredients: true` → captura todos os Ingredients
- Se `includeStockItems: true` → captura todos os StockItems
- Cria items com `itemType` apropriado

### 3. Atualizar Endpoint: Adicionar Item à Conferência

```typescript
POST /api/v1/appraisals/:id/items
```

**Request**:
```json
{
  "itemType": "stock_item",
  "stockItemId": "uuid",
  "physicalQuantity": 20,
  "notes": "Contagem física"
}
```

---

## Mudanças no CMV

### 1. Calcular CMV Consolidado

```typescript
// CMV Total = CMV Ingredients + CMV Stock Items

// CMV Ingredients (já existe)
CMV_Ingredients = Estoque_Inicial_Ingredients + Compras_Ingredients - Estoque_Final_Ingredients

// CMV Stock Items (novo)
CMV_StockItems = Estoque_Inicial_StockItems + Compras_StockItems - Estoque_Final_StockItems

// CMV Total
CMV_Total = CMV_Ingredients + CMV_StockItems
```

### 2. Atualizar CMVPeriod

```prisma
model CMVPeriod {
  id                      String    @id @default(uuid())
  startDate               DateTime
  endDate                 DateTime
  type                    String
  status                  String    @default("open")
  
  // Separar por tipo
  openingStockIngredients  Decimal   @db.Decimal(12, 2) @default(0)
  openingStockItems        Decimal   @db.Decimal(12, 2) @default(0)
  openingStock             Decimal   @db.Decimal(12, 2) @default(0) // Total
  
  purchasesIngredients     Decimal   @db.Decimal(12, 2) @default(0)
  purchasesStockItems      Decimal   @db.Decimal(12, 2) @default(0)
  purchases                Decimal   @db.Decimal(12, 2) @default(0) // Total
  
  closingStockIngredients  Decimal   @db.Decimal(12, 2) @default(0)
  closingStockItems        Decimal   @db.Decimal(12, 2) @default(0)
  closingStock             Decimal   @db.Decimal(12, 2) @default(0) // Total
  
  cmvIngredients           Decimal   @db.Decimal(12, 2) @default(0)
  cmvStockItems            Decimal   @db.Decimal(12, 2) @default(0)
  cmv                      Decimal   @db.Decimal(12, 2) @default(0) // Total
  
  revenue                  Decimal   @db.Decimal(12, 2) @default(0)
  cmvPercentage            Decimal   @db.Decimal(5, 2) @default(0)
  
  createdAt                DateTime  @default(now())
  closedAt                 DateTime?

  products CMVProduct[]

  @@index([startDate, endDate])
  @@index([status])
  @@index([type])
  @@map("cmv_periods")
}
```

### 3. Novo Endpoint: CMV Detalhado

```typescript
GET /api/v1/cmv/periods/:id/detailed
```

**Response**:
```json
{
  "period": {
    "id": "uuid",
    "startDate": "2025-11-01",
    "endDate": "2025-11-30",
    "status": "closed"
  },
  "ingredients": {
    "openingStock": 12350.00,
    "purchases": 8500.00,
    "closingStock": 11200.00,
    "cmv": 9650.00,
    "cmvPercentage": 32.5
  },
  "stockItems": {
    "openingStock": 3070.50,
    "purchases": 2400.00,
    "closingStock": 2800.00,
    "cmv": 2670.50,
    "cmvPercentage": 9.0
  },
  "consolidated": {
    "openingStock": 15420.50,
    "purchases": 10900.00,
    "closingStock": 14000.00,
    "cmv": 12320.50,
    "revenue": 29700.00,
    "cmvPercentage": 41.5,
    "grossMargin": 17379.50,
    "grossMarginPercentage": 58.5
  }
}
```

---

## Mudanças nos Relatórios

### 1. Relatório de Conferência Consolidado

```typescript
GET /api/v1/reports/appraisals/:id
```

**Incluir seções separadas**:
- Insumos (Ingredients)
- Itens de Revenda (Stock Items)
- Consolidado

### 2. Relatório de CMV Consolidado

```typescript
GET /api/v1/reports/cmv/:periodId
```

**Incluir breakdown**:
- CMV de Insumos
- CMV de Revenda
- CMV Total
- Análise por categoria

---

## Implementação

### Fase 1: Schema e Migration

1. Criar migration para atualizar `StockAppraisalItem`
2. Criar migration para atualizar `CMVPeriod`
3. Adicionar relação `StockItem` → `StockAppraisalItem`

### Fase 2: Backend Services

1. Atualizar `AppraisalService`:
   - Suportar ambos os tipos de itens
   - Capturar estoque consolidado
   - Calcular acurácia consolidada

2. Atualizar `CMVService`:
   - Calcular CMV separado por tipo
   - Consolidar CMV total
   - Rastrear compras de StockItems

3. Criar `ConsolidatedStockService`:
   - Listar estoque consolidado
   - Calcular valor total
   - Gerar relatórios unificados

### Fase 3: API Endpoints

1. Criar endpoints consolidados
2. Atualizar endpoints existentes
3. Adicionar filtros por tipo

### Fase 4: Frontend

1. Tela de conferência unificada
2. Seletor de tipo (insumos/revenda/ambos)
3. Relatórios consolidados
4. Dashboard com visão geral

---

## Exemplo de Uso

### Conferência Mensal Completa

```typescript
// 1. Criar conferência incluindo ambos os tipos
POST /api/v1/appraisals
{
  "date": "2025-11-30",
  "type": "monthly",
  "includeIngredients": true,
  "includeStockItems": true
}

// 2. Sistema captura automaticamente:
// - Todos os Ingredients com quantidade teórica
// - Todos os StockItems com quantidade teórica

// 3. Usuário conta fisicamente:
PUT /api/v1/appraisals/:id/items/:itemId
{
  "physicalQuantity": 45.5
}

// 4. Sistema calcula divergências para ambos os tipos

// 5. Gerente aprova
POST /api/v1/appraisals/:id/approve

// 6. Sistema ajusta estoque de ambos os tipos
```

### Fechar Período de CMV

```typescript
// 1. Criar período
POST /api/v1/cmv/periods
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "type": "monthly"
}

// 2. Sistema rastreia automaticamente:
// - Compras de Ingredients (StockTransaction)
// - Compras de StockItems (StockMovement)
// - Vendas de produtos manufaturados
// - Vendas de itens de revenda

// 3. Ao final do período, realizar conferência
POST /api/v1/appraisals
{
  "date": "2025-11-30",
  "type": "monthly",
  "includeIngredients": true,
  "includeStockItems": true
}

// 4. Fechar período
POST /api/v1/cmv/periods/:id/close
{
  "closingAppraisalId": "uuid"
}

// 5. Sistema calcula CMV consolidado:
// CMV = (Estoque Inicial Ingredients + Estoque Inicial StockItems)
//     + (Compras Ingredients + Compras StockItems)
//     - (Estoque Final Ingredients + Estoque Final StockItems)
```

---

## Benefícios

### Para o Negócio

✅ **Visão Completa**: Estoque total em um só lugar  
✅ **CMV Real**: Considera todos os custos (insumos + revenda)  
✅ **Melhor Controle**: Conferência unificada reduz erros  
✅ **Decisões Informadas**: Relatórios consolidados  

### Para os Usuários

✅ **Simplicidade**: Uma conferência para tudo  
✅ **Eficiência**: Menos tempo contando  
✅ **Clareza**: Relatórios mais compreensíveis  
✅ **Flexibilidade**: Pode conferir separado ou junto  

### Técnico

✅ **Não Invasivo**: Mantém modelos existentes  
✅ **Extensível**: Fácil adicionar novos tipos  
✅ **Performático**: Queries otimizadas  
✅ **Auditável**: Histórico completo mantido  

---

## Próximos Passos

1. **Revisar e Aprovar** esta proposta
2. **Criar Migration** para schema
3. **Implementar Backend** (services e repositories)
4. **Criar API Endpoints**
5. **Atualizar Frontend**
6. **Testar Integração**
7. **Documentar** para usuários finais

---

**Status**: Proposta  
**Criado**: 10/11/2025  
**Autor**: Kiro AI Assistant
