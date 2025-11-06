# Design Document - Conferência de Estoque e CMV

## Overview

Este documento descreve o design técnico do sistema de Conferência de Estoque Periódica e Cálculo de CMV. O sistema será integrado ao módulo existente de gestão de estoque e receitas, permitindo inventários físicos, cálculo de divergências e determinação do CMV real.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  Appraisal Pages  │  CMV Pages  │  Reports  │  Dashboard    │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                     Backend API (Express)                    │
├─────────────────────────────────────────────────────────────┤
│  Controllers  │  Services  │  Repositories  │  Middlewares   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│  StockAppraisal  │  CMVPeriod  │  CMVProduct  │  Ingredient │
└─────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
┌──────────────────────┐
│  AppraisalService    │
├──────────────────────┤
│ + create()           │
│ + addItem()          │
│ + calculateAccuracy()│
│ + approve()          │
└──────────────────────┘
         ↓
┌──────────────────────┐
│  CMVService          │
├──────────────────────┤
│ + createPeriod()     │
│ + closePeriod()      │
│ + calculateCMV()     │
│ + analyzeProducts()  │
└──────────────────────┘
         ↓
┌──────────────────────┐
│  ReportService       │
├──────────────────────┤
│ + generateCMVReport()│
│ + comparePeriods()   │
│ + exportPDF()        │
└──────────────────────┘
```

---

## Data Models

### StockAppraisal (Conferência de Estoque)

```typescript
interface StockAppraisal {
  id: string;                    // UUID
  date: Date;                    // Data da conferência
  type: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'approved';
  userId: string;                // Usuário que criou
  totalTheoretical: Decimal;     // Total teórico em R$
  totalPhysical: Decimal;        // Total físico em R$
  totalDifference: Decimal;      // Diferença total em R$
  accuracy: Decimal;             // Acurácia em %
  notes: string;                 // Observações gerais
  approvedBy: string;            // Usuário aprovador
  approvedAt: Date;              // Data de aprovação
  createdAt: Date;
  completedAt: Date;
  
  items: StockAppraisalItem[];   // Itens da conferência
}
```

### StockAppraisalItem (Item da Conferência)

```typescript
interface StockAppraisalItem {
  appraisalId: string;
  ingredientId: string;
  theoreticalQuantity: Decimal;  // Quantidade teórica
  physicalQuantity: Decimal;     // Quantidade física contada
  difference: Decimal;           // Diferença (físico - teórico)
  differencePercentage: Decimal; // % de diferença
  unitCost: Decimal;             // Custo unitário
  totalDifference: Decimal;      // Diferença em R$
  reason: string;                // Motivo da divergência
  notes: string;                 // Observações
  
  ingredient: Ingredient;
}
```

### CMVPeriod (Período de CMV)

```typescript
interface CMVPeriod {
  id: string;
  startDate: Date;               // Data inicial
  endDate: Date;                 // Data final
  type: 'daily' | 'weekly' | 'monthly';
  status: 'open' | 'closed';
  openingStock: Decimal;         // Estoque inicial em R$
  purchases: Decimal;            // Compras do período em R$
  closingStock: Decimal;         // Estoque final em R$
  cmv: Decimal;                  // CMV calculado
  revenue: Decimal;              // Receita do período
  cmvPercentage: Decimal;        // CMV % sobre receita
  createdAt: Date;
  closedAt: Date;
  
  products: CMVProduct[];        // CMV por produto
}
```

### CMVProduct (CMV por Produto)

```typescript
interface CMVProduct {
  periodId: string;
  productId: string;
  quantitySold: number;          // Quantidade vendida
  revenue: Decimal;              // Receita do produto
  cost: Decimal;                 // Custo do produto
  cmv: Decimal;                  // CMV do produto
  margin: Decimal;               // Margem em R$
  marginPercentage: Decimal;     // Margem em %
  
  product: Product;
}
```

---

## Database Schema Updates

### Existing Tables (Already in schema.prisma)

✅ `StockAppraisal` - Já existe  
✅ `StockAppraisalItem` - Já existe  
✅ `CMVPeriod` - Já existe  
✅ `CMVProduct` - Já existe  

**Nota**: Os models já estão definidos no schema do Prisma. Não são necessárias novas migrations.

---

## API Endpoints

### Stock Appraisal Endpoints

```
POST   /api/v1/appraisals                    # Criar conferência
GET    /api/v1/appraisals                    # Listar conferências
GET    /api/v1/appraisals/:id                # Buscar conferência
PUT    /api/v1/appraisals/:id                # Atualizar conferência
DELETE /api/v1/appraisals/:id                # Excluir conferência

POST   /api/v1/appraisals/:id/items          # Adicionar item
PUT    /api/v1/appraisals/:id/items/:itemId  # Atualizar item
DELETE /api/v1/appraisals/:id/items/:itemId  # Remover item

POST   /api/v1/appraisals/:id/complete       # Completar conferência
POST   /api/v1/appraisals/:id/approve        # Aprovar conferência
GET    /api/v1/appraisals/:id/accuracy       # Calcular acurácia
```

### CMV Period Endpoints

```
POST   /api/v1/cmv/periods                   # Criar período
GET    /api/v1/cmv/periods                   # Listar períodos
GET    /api/v1/cmv/periods/:id               # Buscar período
PUT    /api/v1/cmv/periods/:id               # Atualizar período
DELETE /api/v1/cmv/periods/:id               # Excluir período

POST   /api/v1/cmv/periods/:id/close         # Fechar período
GET    /api/v1/cmv/periods/:id/calculate     # Calcular CMV
GET    /api/v1/cmv/periods/:id/products      # CMV por produto
GET    /api/v1/cmv/periods/:id/report        # Gerar relatório
```

### Report Endpoints

```
GET    /api/v1/reports/cmv                   # Relatório de CMV
GET    /api/v1/reports/cmv/compare           # Comparar períodos
GET    /api/v1/reports/cmv/export            # Exportar PDF
GET    /api/v1/reports/appraisals            # Relatório de conferências
GET    /api/v1/reports/accuracy              # Evolução de acurácia
```

---

## Business Logic

### Cálculo de Divergência

```typescript
function calculateDivergence(theoretical: number, physical: number) {
  const difference = physical - theoretical;
  const percentage = theoretical > 0 
    ? (difference / theoretical) * 100 
    : 0;
  
  return {
    difference,
    percentage,
    type: difference >= 0 ? 'surplus' : 'shortage'
  };
}
```

### Cálculo de Acurácia

```typescript
function calculateAccuracy(items: StockAppraisalItem[]) {
  const totalTheoretical = items.reduce((sum, item) => 
    sum + (item.theoreticalQuantity * item.unitCost), 0
  );
  
  const totalDifference = items.reduce((sum, item) => 
    sum + Math.abs(item.totalDifference), 0
  );
  
  const accuracy = totalTheoretical > 0
    ? (1 - (totalDifference / totalTheoretical)) * 100
    : 100;
  
  return Math.max(0, Math.min(100, accuracy));
}
```

### Cálculo de CMV

```typescript
function calculateCMV(period: CMVPeriod) {
  // CMV = Estoque Inicial + Compras - Estoque Final
  const cmv = period.openingStock + period.purchases - period.closingStock;
  
  // CMV % = (CMV / Receita) × 100
  const cmvPercentage = period.revenue > 0
    ? (cmv / period.revenue) * 100
    : 0;
  
  return {
    cmv,
    cmvPercentage,
    grossMargin: period.revenue - cmv,
    grossMarginPercentage: period.revenue > 0
      ? ((period.revenue - cmv) / period.revenue) * 100
      : 0
  };
}
```

### CMV por Produto

```typescript
function calculateProductCMV(product: Product, quantitySold: number) {
  // Custo baseado na receita do produto
  const cost = product.recipe 
    ? product.recipe.costPerPortion * quantitySold
    : 0;
  
  const revenue = product.price * quantitySold;
  const margin = revenue - cost;
  const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0;
  
  return {
    cost,
    revenue,
    margin,
    marginPercentage,
    cmv: cost
  };
}
```

---

## Component Structure

### Backend Services

#### AppraisalService

```typescript
class AppraisalService {
  // CRUD Operations
  async create(data: CreateAppraisalDTO): Promise<StockAppraisal>
  async getAll(filters: AppraisalFilters): Promise<StockAppraisal[]>
  async getById(id: string): Promise<StockAppraisal>
  async update(id: string, data: UpdateAppraisalDTO): Promise<StockAppraisal>
  async delete(id: string): Promise<void>
  
  // Item Management
  async addItem(appraisalId: string, item: CreateAppraisalItemDTO): Promise<void>
  async updateItem(appraisalId: string, ingredientId: string, data: UpdateAppraisalItemDTO): Promise<void>
  async removeItem(appraisalId: string, ingredientId: string): Promise<void>
  
  // Business Logic
  async captureTheoreticalStock(appraisalId: string): Promise<void>
  async calculateAccuracy(appraisalId: string): Promise<number>
  async complete(appraisalId: string): Promise<StockAppraisal>
  async approve(appraisalId: string, userId: string): Promise<StockAppraisal>
  async adjustStock(appraisalId: string): Promise<void>
}
```

#### CMVService

```typescript
class CMVService {
  // Period Management
  async createPeriod(data: CreatePeriodDTO): Promise<CMVPeriod>
  async getAll(filters: PeriodFilters): Promise<CMVPeriod[]>
  async getById(id: string): Promise<CMVPeriod>
  async closePeriod(id: string, closingAppraisalId: string): Promise<CMVPeriod>
  
  // CMV Calculation
  async calculateCMV(periodId: string): Promise<CMVCalculation>
  async calculateProductCMV(periodId: string): Promise<CMVProduct[]>
  async registerPurchase(periodId: string, amount: Decimal): Promise<void>
  
  // Analysis
  async analyzePeriod(periodId: string): Promise<PeriodAnalysis>
  async comparePeriods(periodIds: string[]): Promise<PeriodComparison>
}
```

#### ReportService

```typescript
class ReportService {
  async generateCMVReport(periodId: string): Promise<CMVReport>
  async generateAppraisalReport(appraisalId: string): Promise<AppraisalReport>
  async generateAccuracyTrend(startDate: Date, endDate: Date): Promise<AccuracyTrend>
  async exportCMVReportPDF(periodId: string): Promise<Buffer>
  async exportAppraisalPDF(appraisalId: string): Promise<Buffer>
}
```

### Frontend Pages

#### Appraisal Pages

```
/appraisals                    # Lista de conferências
/appraisals/new                # Nova conferência
/appraisals/:id                # Detalhes da conferência
/appraisals/:id/count          # Tela de contagem
/appraisals/:id/review         # Revisão antes de aprovar
```

#### CMV Pages

```
/cmv                           # Dashboard de CMV
/cmv/periods                   # Lista de períodos
/cmv/periods/new               # Novo período
/cmv/periods/:id               # Detalhes do período
/cmv/periods/:id/close         # Fechar período
/cmv/reports                   # Relatórios de CMV
```

---

## User Flows

### Flow 1: Realizar Conferência de Estoque

```
1. Usuário acessa /appraisals
2. Clica em "Nova Conferência"
3. Preenche: data, tipo, observações
4. Sistema captura estoque teórico
5. Usuário acessa tela de contagem
6. Para cada ingrediente:
   a. Visualiza quantidade teórica
   b. Insere quantidade física
   c. Sistema calcula divergência
   d. Adiciona motivo se necessário
7. Usuário completa conferência
8. Sistema calcula acurácia total
9. Gerente revisa divergências
10. Gerente aprova conferência
11. Sistema ajusta estoque teórico
```

### Flow 2: Calcular CMV do Período

```
1. Gerente acessa /cmv/periods
2. Clica em "Novo Período"
3. Define data inicial e final
4. Sistema cria período com status "aberto"
5. Sistema captura estoque inicial (última conferência)
6. Durante o período:
   a. Compras são registradas automaticamente
   b. Vendas são registradas
7. Ao final do período:
   a. Gerente clica em "Fechar Período"
   b. Sistema solicita conferência de estoque final
   c. Gerente realiza conferência
   d. Gerente aprova conferência
8. Sistema calcula CMV:
   CMV = Estoque Inicial + Compras - Estoque Final
9. Sistema calcula CMV por produto
10. Sistema gera relatório completo
```

---

## Error Handling

### Validation Errors

```typescript
// Conferência sem itens
if (appraisal.items.length === 0) {
  throw new ValidationError('Conferência deve ter pelo menos um item');
}

// Período sobreposto
if (hasOverlappingPeriod(startDate, endDate)) {
  throw new ValidationError('Já existe um período neste intervalo');
}

// Acurácia muito baixa
if (accuracy < 85 && !justification) {
  throw new ValidationError('Acurácia abaixo de 85% requer justificativa');
}
```

### Business Rule Errors

```typescript
// Tentar editar conferência aprovada
if (appraisal.status === 'approved') {
  throw new BusinessRuleError('Conferência aprovada não pode ser editada');
}

// Fechar período sem conferência final
if (!closingAppraisal) {
  throw new BusinessRuleError('Período requer conferência de estoque final');
}

// Múltiplos períodos abertos
if (hasOpenPeriod()) {
  throw new BusinessRuleError('Já existe um período aberto');
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('AppraisalService', () => {
  test('should calculate divergence correctly')
  test('should calculate accuracy correctly')
  test('should not allow negative physical quantity')
  test('should require justification for low accuracy')
  test('should adjust stock on approval')
});

describe('CMVService', () => {
  test('should calculate CMV correctly')
  test('should not allow overlapping periods')
  test('should calculate product CMV correctly')
  test('should register purchases automatically')
});
```

### Integration Tests

```typescript
describe('Appraisal Flow', () => {
  test('should complete full appraisal flow')
  test('should adjust stock after approval')
  test('should generate alerts for high divergence')
});

describe('CMV Flow', () => {
  test('should calculate CMV for complete period')
  test('should track purchases during period')
  test('should generate accurate reports')
});
```

### E2E Tests

```typescript
describe('Stock Appraisal E2E', () => {
  test('user can create and complete appraisal')
  test('manager can approve appraisal')
  test('system adjusts stock correctly')
});

describe('CMV Period E2E', () => {
  test('user can create and close period')
  test('system calculates CMV correctly')
  test('user can generate reports')
});
```

---

## Performance Considerations

### Database Optimization

```sql
-- Índices para consultas frequentes
CREATE INDEX idx_appraisals_date ON stock_appraisals(date);
CREATE INDEX idx_appraisals_status ON stock_appraisals(status);
CREATE INDEX idx_cmv_periods_dates ON cmv_periods(start_date, end_date);
CREATE INDEX idx_cmv_products_period ON cmv_products(period_id);
```

### Caching Strategy

```typescript
// Cache de estoque teórico (5 minutos)
const theoreticalStock = await cache.get('theoretical_stock', async () => {
  return await calculateTheoreticalStock();
}, { ttl: 300 });

// Cache de relatórios (1 hora)
const report = await cache.get(`cmv_report_${periodId}`, async () => {
  return await generateCMVReport(periodId);
}, { ttl: 3600 });
```

### Batch Processing

```typescript
// Processar itens em lotes
async function processAppraisalItems(items: AppraisalItem[]) {
  const batchSize = 50;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(item => processItem(item)));
  }
}
```

---

## Security Considerations

### Authorization

```typescript
// Apenas gerentes podem aprovar
@Authorize('manager')
async approve(appraisalId: string) { }

// Apenas gerentes podem fechar períodos
@Authorize('manager')
async closePeriod(periodId: string) { }
```

### Audit Log

```typescript
// Registrar todas as ações críticas
await auditLog.create({
  action: 'APPRAISAL_APPROVED',
  userId: user.id,
  resourceId: appraisal.id,
  previousState: appraisal,
  newState: updatedAppraisal,
  timestamp: new Date()
});
```

---

## Monitoring and Alerts

### Metrics to Track

```typescript
// Métricas de conferência
- Tempo médio de conferência
- Taxa de acurácia média
- Número de divergências críticas
- Taxa de aprovação

// Métricas de CMV
- CMV % médio
- Variação CMV período a período
- Produtos com maior CMV
- Margem bruta média
```

### Alerts

```typescript
// Alertas automáticos
- Acurácia < 90%
- Divergência > 20% em qualquer item
- CMV % > 40%
- Período aberto há mais de 30 dias
```

---

**Status**: Draft  
**Version**: 1.0  
**Created**: 06/11/2025  
**Last Updated**: 06/11/2025
