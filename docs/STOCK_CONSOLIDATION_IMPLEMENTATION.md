# Guia de Implementação - Consolidação de Estoque

## Resumo

Este guia descreve como implementar a consolidação de estoque (Insumos + Revenda) no sistema.

---

## Arquivos Criados

### 1. Documentação
- ✅ `docs/STOCK_CONSOLIDATION_PROPOSAL.md` - Proposta completa
- ✅ `docs/STOCK_CONSOLIDATION_IMPLEMENTATION.md` - Este guia

### 2. Database
- ✅ `prisma/migrations/consolidate_stock_schema.sql` - Migration SQL
- ✅ `prisma/schema.prisma` - Schema atualizado

### 3. Backend
- ✅ `src/services/consolidated-stock.service.ts` - Serviço consolidado
- ✅ `src/controllers/consolidated-stock.controller.ts` - Controller
- ✅ `src/routes/consolidated-stock.routes.ts` - Rotas

---

## Passos de Implementação

### Passo 1: Aplicar Migration

```bash
# Opção 1: Aplicar migration SQL diretamente
psql $DATABASE_URL -f prisma/migrations/consolidate_stock_schema.sql

# Opção 2: Criar migration do Prisma
npx prisma migrate dev --name consolidate_stock

# Gerar cliente Prisma
npx prisma generate
```

### Passo 2: Registrar Rotas

Adicionar no arquivo `src/app.ts` ou onde as rotas são registradas:

```typescript
import consolidatedStockRoutes from '@/routes/consolidated-stock.routes';

// Registrar rota
app.use('/api/v1/stock/consolidated', consolidatedStockRoutes);
```

### Passo 3: Atualizar AppraisalService

Modificar `src/services/appraisal.service.ts` para suportar StockItems:

```typescript
// Adicionar ao método captureTheoreticalStock
async captureTheoreticalStock(
  appraisalId: string, 
  options: {
    includeIngredients?: boolean;
    includeStockItems?: boolean;
  } = { includeIngredients: true, includeStockItems: false }
) {
  const appraisal = await this.getById(appraisalId);
  
  // Capturar ingredients (existente)
  if (options.includeIngredients) {
    const ingredients = await prisma.ingredient.findMany({
      where: { isActive: true },
    });
    
    for (const ingredient of ingredients) {
      await prisma.stockAppraisalItem.create({
        data: {
          appraisalId,
          ingredientId: ingredient.id,
          itemType: 'ingredient',
          theoreticalQuantity: ingredient.currentQuantity,
          unitCost: ingredient.averageCost,
        },
      });
    }
  }
  
  // Capturar stock items (novo)
  if (options.includeStockItems) {
    const stockItems = await prisma.stockItem.findMany({
      where: { 
        establishmentId: appraisal.establishmentId,
        isActive: true 
      },
    });
    
    for (const item of stockItems) {
      await prisma.stockAppraisalItem.create({
        data: {
          appraisalId,
          stockItemId: item.id,
          itemType: 'stock_item',
          theoreticalQuantity: item.currentQuantity,
          unitCost: item.costPrice,
        },
      });
    }
  }
}
```

### Passo 4: Atualizar CMVService

Modificar `src/services/cmv.service.ts` para calcular CMV consolidado:

```typescript
async calculateCMV(periodId: string) {
  const period = await this.getById(periodId);
  
  // Calcular CMV de Ingredients
  const cmvIngredients = 
    period.openingStockIngredients + 
    period.purchasesIngredients - 
    period.closingStockIngredients;
  
  // Calcular CMV de Stock Items
  const cmvStockItems = 
    period.openingStockItems + 
    period.purchasesStockItems - 
    period.closingStockItems;
  
  // CMV Total
  const cmvTotal = cmvIngredients + cmvStockItems;
  
  // Atualizar período
  await prisma.cmvPeriod.update({
    where: { id: periodId },
    data: {
      cmvIngredients,
      cmvStockItems,
      cmv: cmvTotal,
      openingStock: period.openingStockIngredients + period.openingStockItems,
      purchases: period.purchasesIngredients + period.purchasesStockItems,
      closingStock: period.closingStockIngredients + period.closingStockItems,
      cmvPercentage: period.revenue > 0 
        ? (cmvTotal / period.revenue) * 100 
        : 0,
    },
  });
  
  return { cmvIngredients, cmvStockItems, cmvTotal };
}
```

### Passo 5: Testar API

```bash
# 1. Listar estoque consolidado
curl -X GET http://localhost:3000/api/v1/stock/consolidated \
  -H "Authorization: Bearer $TOKEN"

# 2. Filtrar apenas ingredients
curl -X GET "http://localhost:3000/api/v1/stock/consolidated?type=ingredient" \
  -H "Authorization: Bearer $TOKEN"

# 3. Filtrar apenas stock items
curl -X GET "http://localhost:3000/api/v1/stock/consolidated?type=stock_item" \
  -H "Authorization: Bearer $TOKEN"

# 4. Buscar por código de barras
curl -X GET http://localhost:3000/api/v1/stock/consolidated/search/7891234567890 \
  -H "Authorization: Bearer $TOKEN"

# 5. Itens com estoque baixo
curl -X GET http://localhost:3000/api/v1/stock/consolidated/low-stock \
  -H "Authorization: Bearer $TOKEN"

# 6. Valor do estoque em uma data
curl -X GET "http://localhost:3000/api/v1/stock/consolidated/value?date=2025-11-01" \
  -H "Authorization: Bearer $TOKEN"

# 7. Compras em um período
curl -X GET "http://localhost:3000/api/v1/stock/consolidated/purchases?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Próximos Passos (Frontend)

### 1. Criar Página de Estoque Consolidado

```typescript
// web-app/src/pages/stock/ConsolidatedStockPage.tsx

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export function ConsolidatedStockPage() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'ingredient', 'stock_item'
  
  useEffect(() => {
    loadData();
  }, [filter]);
  
  async function loadData() {
    const response = await api.get('/stock/consolidated', {
      params: { type: filter }
    });
    setData(response.data);
  }
  
  return (
    <div>
      <h1>Estoque Consolidado</h1>
      
      {/* Filtros */}
      <div>
        <button onClick={() => setFilter('all')}>Todos</button>
        <button onClick={() => setFilter('ingredient')}>Insumos</button>
        <button onClick={() => setFilter('stock_item')}>Revenda</button>
      </div>
      
      {/* Resumo */}
      {data && (
        <div>
          <h2>Resumo</h2>
          <p>Total de Itens: {data.summary.totalItems}</p>
          <p>Valor Total: R$ {data.summary.totalValue.toFixed(2)}</p>
          <p>Insumos: R$ {data.summary.ingredientsValue.toFixed(2)}</p>
          <p>Revenda: R$ {data.summary.stockItemsValue.toFixed(2)}</p>
        </div>
      )}
      
      {/* Tabelas */}
      {data && (
        <>
          {(filter === 'all' || filter === 'ingredient') && (
            <div>
              <h3>Insumos ({data.ingredients.length})</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Quantidade</th>
                    <th>Unidade</th>
                    <th>Custo Unit.</th>
                    <th>Valor Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ingredients.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.currentQuantity}</td>
                      <td>{item.unit}</td>
                      <td>R$ {item.unitCost.toFixed(2)}</td>
                      <td>R$ {item.totalValue.toFixed(2)}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {(filter === 'all' || filter === 'stock_item') && (
            <div>
              <h3>Itens de Revenda ({data.stockItems.length})</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Quantidade</th>
                    <th>Unidade</th>
                    <th>Custo Unit.</th>
                    <th>Valor Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stockItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.currentQuantity}</td>
                      <td>{item.unit}</td>
                      <td>R$ {item.unitCost.toFixed(2)}</td>
                      <td>R$ {item.totalValue.toFixed(2)}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

### 2. Atualizar Página de Conferência

Adicionar opção para incluir StockItems na conferência:

```typescript
// web-app/src/pages/appraisals/NewAppraisalPage.tsx

<form onSubmit={handleSubmit}>
  <input type="date" name="date" required />
  
  <select name="type">
    <option value="daily">Diária</option>
    <option value="weekly">Semanal</option>
    <option value="monthly">Mensal</option>
  </select>
  
  {/* Novo: Opções de inclusão */}
  <div>
    <label>
      <input type="checkbox" name="includeIngredients" defaultChecked />
      Incluir Insumos
    </label>
    
    <label>
      <input type="checkbox" name="includeStockItems" />
      Incluir Itens de Revenda
    </label>
  </div>
  
  <textarea name="notes" placeholder="Observações" />
  
  <button type="submit">Criar Conferência</button>
</form>
```

### 3. Atualizar Dashboard de CMV

Mostrar breakdown de CMV por tipo:

```typescript
// web-app/src/pages/cmv/CMVDashboard.tsx

<div className="cmv-breakdown">
  <h3>CMV Detalhado</h3>
  
  <div className="cmv-section">
    <h4>Insumos (Produção)</h4>
    <p>Estoque Inicial: R$ {period.openingStockIngredients}</p>
    <p>Compras: R$ {period.purchasesIngredients}</p>
    <p>Estoque Final: R$ {period.closingStockIngredients}</p>
    <p><strong>CMV: R$ {period.cmvIngredients}</strong></p>
  </div>
  
  <div className="cmv-section">
    <h4>Revenda</h4>
    <p>Estoque Inicial: R$ {period.openingStockItems}</p>
    <p>Compras: R$ {period.purchasesStockItems}</p>
    <p>Estoque Final: R$ {period.closingStockItems}</p>
    <p><strong>CMV: R$ {period.cmvStockItems}</strong></p>
  </div>
  
  <div className="cmv-total">
    <h4>Total Consolidado</h4>
    <p><strong>CMV Total: R$ {period.cmv}</strong></p>
    <p>CMV %: {period.cmvPercentage}%</p>
  </div>
</div>
```

---

## Checklist de Implementação

### Backend
- [x] Criar migration SQL
- [x] Atualizar schema Prisma
- [x] Criar ConsolidatedStockService
- [x] Criar ConsolidatedStockController
- [x] Criar rotas consolidadas
- [ ] Atualizar AppraisalService
- [ ] Atualizar CMVService
- [ ] Adicionar testes unitários
- [ ] Adicionar testes de integração

### Frontend
- [ ] Criar página de estoque consolidado
- [ ] Atualizar página de nova conferência
- [ ] Atualizar página de contagem
- [ ] Atualizar dashboard de CMV
- [ ] Adicionar filtros e busca
- [ ] Criar componentes reutilizáveis

### Documentação
- [x] Proposta de solução
- [x] Guia de implementação
- [ ] Atualizar API docs
- [ ] Atualizar user guide
- [ ] Criar FAQ específico

### Testes
- [ ] Testar migration
- [ ] Testar endpoints consolidados
- [ ] Testar conferência com ambos os tipos
- [ ] Testar cálculo de CMV consolidado
- [ ] Testar relatórios

---

## Notas Importantes

### 1. Compatibilidade com Dados Existentes

A migration foi projetada para ser **não destrutiva**:
- Todos os `StockAppraisalItem` existentes são marcados como `itemType: 'ingredient'`
- Todos os `CMVPeriod` existentes têm seus valores migrados para os novos campos
- Nenhum dado é perdido

### 2. Validação de Dados

O schema garante que:
- Exatamente um de `ingredientId` ou `stockItemId` está preenchido
- O `itemType` corresponde ao ID preenchido
- Não é possível ter ambos ou nenhum preenchido

### 3. Performance

Para grandes volumes de dados:
- Considere adicionar índices adicionais
- Use paginação nas listagens
- Implemente cache para relatórios
- Otimize queries com `select` específicos

### 4. Segurança

- Todas as rotas requerem autenticação
- Validar `establishmentId` em todas as operações
- Não expor dados de outros estabelecimentos
- Auditar operações críticas

---

## Suporte

Para dúvidas ou problemas:
1. Consulte `docs/STOCK_CONSOLIDATION_PROPOSAL.md`
2. Revise os logs do servidor
3. Verifique a documentação da API
4. Entre em contato com o time de desenvolvimento

---

**Criado**: 10/11/2025  
**Versão**: 1.0  
**Status**: Pronto para implementação
