# CMV e Gestão de Custos - Design Técnico

## Arquitetura

### Camadas
```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  - RecipePages                      │
│  - ProductPages                     │
│  - CMVDashboard                     │
│  - AppraisalPages                   │
└─────────────────────────────────────┘
              ↓ HTTP/REST
┌─────────────────────────────────────┐
│      Controllers (Express)          │
│  - RecipeController                 │
│  - ProductController                │
│  - CMVController                    │
│  - AppraisalController              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Services (Business)         │
│  - RecipeService                    │
│  - ProductService                   │
│  - CMVService                       │
│  - AppraisalService                 │
│  - PricingService                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Repositories (Data)            │
│  - RecipeRepository                 │
│  - ProductRepository                │
│  - CMVRepository                    │
│  - AppraisalRepository              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Database (PostgreSQL)         │
│  - recipes                          │
│  - recipe_ingredients               │
│  - products                         │
│  - cmv_periods                      │
│  - stock_appraisals                 │
└─────────────────────────────────────┘
```

## Schema do Banco de Dados

### Tabela: recipes
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  yield DECIMAL(10,3) NOT NULL,
  yield_unit VARCHAR(20) NOT NULL,
  preparation_time INTEGER,
  instructions TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  total_cost DECIMAL(10,4) NOT NULL DEFAULT 0,
  cost_per_portion DECIMAL(10,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_recipes_category (category),
  INDEX idx_recipes_active (is_active),
  INDEX idx_recipes_name (name)
);
```

### Tabela: recipe_ingredients
```sql
CREATE TABLE recipe_ingredients (
  recipe_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  cost DECIMAL(10,4) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (recipe_id, ingredient_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
  INDEX idx_recipe_ingredients_recipe (recipe_id),
  INDEX idx_recipe_ingredients_ingredient (ingredient_id)
);
```

### Tabela: products (atualizada)
```sql
ALTER TABLE products ADD COLUMN recipe_id UUID;
ALTER TABLE products ADD COLUMN suggested_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN target_margin DECIMAL(5,2);
ALTER TABLE products ADD COLUMN current_margin DECIMAL(5,2);
ALTER TABLE products ADD COLUMN markup DECIMAL(5,2);
ALTER TABLE products ADD COLUMN preparation_time INTEGER;
ALTER TABLE products ADD COLUMN sales_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN revenue DECIMAL(12,2) DEFAULT 0;

ALTER TABLE products ADD FOREIGN KEY (recipe_id) REFERENCES recipes(id);
CREATE INDEX idx_products_recipe ON products(recipe_id);
```

### Tabela: stock_appraisals
```sql
CREATE TABLE stock_appraisals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  user_id UUID NOT NULL,
  total_theoretical DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_physical DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_difference DECIMAL(12,2) NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX idx_appraisals_date (date),
  INDEX idx_appraisals_status (status),
  INDEX idx_appraisals_type (type)
);
```

### Tabela: stock_appraisal_items
```sql
CREATE TABLE stock_appraisal_items (
  appraisal_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  theoretical_quantity DECIMAL(10,3) NOT NULL,
  physical_quantity DECIMAL(10,3),
  difference DECIMAL(10,3),
  difference_percentage DECIMAL(5,2),
  unit_cost DECIMAL(10,4) NOT NULL,
  total_difference DECIMAL(10,2),
  reason VARCHAR(100),
  notes TEXT,
  
  PRIMARY KEY (appraisal_id, ingredient_id),
  FOREIGN KEY (appraisal_id) REFERENCES stock_appraisals(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
  INDEX idx_appraisal_items_appraisal (appraisal_id),
  INDEX idx_appraisal_items_ingredient (ingredient_id)
);
```

### Tabela: cmv_periods
```sql
CREATE TABLE cmv_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  opening_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
  purchases DECIMAL(12,2) NOT NULL DEFAULT 0,
  closing_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
  cmv DECIMAL(12,2) NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  cmv_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  
  INDEX idx_cmv_periods_dates (start_date, end_date),
  INDEX idx_cmv_periods_status (status),
  INDEX idx_cmv_periods_type (type)
);
```

### Tabela: cmv_products
```sql
CREATE TABLE cmv_products (
  period_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  cmv DECIMAL(12,2) NOT NULL DEFAULT 0,
  margin DECIMAL(12,2) NOT NULL DEFAULT 0,
  margin_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  
  PRIMARY KEY (period_id, product_id),
  FOREIGN KEY (period_id) REFERENCES cmv_periods(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_cmv_products_period (period_id),
  INDEX idx_cmv_products_product (product_id)
);
```

## APIs REST

### Recipes

#### POST /api/v1/recipes
Criar nova receita
```json
{
  "name": "Pizza Margherita",
  "description": "Pizza clássica italiana",
  "category": "pizza",
  "yield": 1,
  "yieldUnit": "unidade",
  "preparationTime": 30,
  "instructions": "1. Abrir massa...",
  "ingredients": [
    {
      "ingredientId": "uuid",
      "quantity": 0.3,
      "unit": "kg",
      "notes": "Massa pronta"
    }
  ]
}
```

#### GET /api/v1/recipes
Listar receitas
Query params: `?category=pizza&active=true&search=margherita`

#### GET /api/v1/recipes/:id
Detalhes da receita com ingredientes e custos

#### PUT /api/v1/recipes/:id
Atualizar receita (cria nova versão)

#### POST /api/v1/recipes/:id/calculate-cost
Recalcular custo da receita

### Products

#### POST /api/v1/products
Criar produto preparado
```json
{
  "name": "Pizza Margherita Grande",
  "description": "Pizza de 35cm",
  "categoryId": "uuid",
  "recipeId": "uuid",
  "targetMargin": 65,
  "salePrice": 45.00
}
```

#### GET /api/v1/products
Listar produtos preparados

#### GET /api/v1/products/:id
Detalhes do produto com receita e análise de custos

#### PUT /api/v1/products/:id/price
Atualizar preço
```json
{
  "salePrice": 50.00,
  "reason": "Aumento de custos"
}
```

#### GET /api/v1/products/:id/profitability
Análise de rentabilidade do produto

### Stock Appraisals

#### POST /api/v1/appraisals
Criar nova apuração
```json
{
  "date": "2025-01-15",
  "type": "monthly"
}
```

#### GET /api/v1/appraisals
Listar apurações

#### GET /api/v1/appraisals/:id
Detalhes da apuração

#### PUT /api/v1/appraisals/:id/items
Atualizar contagem física
```json
{
  "items": [
    {
      "ingredientId": "uuid",
      "physicalQuantity": 10.5,
      "reason": "normal",
      "notes": ""
    }
  ]
}
```

#### POST /api/v1/appraisals/:id/complete
Finalizar apuração

#### POST /api/v1/appraisals/:id/approve
Aprovar ajustes (requer permissão)

### CMV

#### POST /api/v1/cmv/periods
Criar período de CMV
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "type": "monthly"
}
```

#### GET /api/v1/cmv/periods
Listar períodos

#### GET /api/v1/cmv/periods/:id
Detalhes do período com produtos

#### POST /api/v1/cmv/periods/:id/close
Fechar período e calcular CMV

#### GET /api/v1/cmv/dashboard
Dashboard com KPIs
```json
{
  "currentPeriod": {
    "cmv": 15000,
    "revenue": 50000,
    "cmvPercentage": 30,
    "margin": 70
  },
  "topProducts": [...],
  "alerts": [...]
}
```

## Serviços

### RecipeService

```typescript
class RecipeService {
  async create(data: CreateRecipeDTO): Promise<Recipe>
  async update(id: string, data: UpdateRecipeDTO): Promise<Recipe>
  async calculateCost(recipeId: string): Promise<RecipeCost>
  async getById(id: string): Promise<Recipe>
  async getAll(filters: RecipeFilters): Promise<Recipe[]>
  async duplicate(id: string, newName: string): Promise<Recipe>
  async addIngredient(recipeId: string, ingredient: RecipeIngredientDTO): Promise<void>
  async removeIngredient(recipeId: string, ingredientId: string): Promise<void>
  async updateIngredient(recipeId: string, ingredientId: string, data: UpdateIngredientDTO): Promise<void>
}
```

### ProductService

```typescript
class ProductService {
  async create(data: CreateProductDTO): Promise<Product>
  async update(id: string, data: UpdateProductDTO): Promise<Product>
  async updatePrice(id: string, price: number, reason: string): Promise<Product>
  async calculateSuggestedPrice(productId: string): Promise<number>
  async getProfitability(productId: string): Promise<ProfitabilityAnalysis>
  async getAll(filters: ProductFilters): Promise<Product[]>
  async getById(id: string): Promise<Product>
}
```

### PricingService

```typescript
class PricingService {
  calculateSuggestedPrice(cost: number, targetMargin: number): number
  calculateMargin(cost: number, price: number): number
  calculateMarkup(cost: number, price: number): number
  analyzeProfitability(product: Product): ProfitabilityAnalysis
  suggestPriceAdjustment(product: Product): PriceAdjustment
}
```

### CMVService

```typescript
class CMVService {
  async createPeriod(data: CreatePeriodDTO): Promise<CMVPeriod>
  async closePeriod(periodId: string): Promise<CMVPeriod>
  async calculateCMV(periodId: string): Promise<CMVCalculation>
  async getProductCMV(periodId: string, productId: string): Promise<ProductCMV>
  async getDashboard(periodId?: string): Promise<CMVDashboard>
  async getKPIs(periodId: string): Promise<CMVKPIs>
}
```

### AppraisalService

```typescript
class AppraisalService {
  async create(data: CreateAppraisalDTO): Promise<StockAppraisal>
  async updateItems(appraisalId: string, items: AppraisalItemDTO[]): Promise<void>
  async complete(appraisalId: string): Promise<StockAppraisal>
  async approve(appraisalId: string, userId: string): Promise<StockAppraisal>
  async calculateAccuracy(appraisalId: string): Promise<number>
  async getById(id: string): Promise<StockAppraisal>
  async getAll(filters: AppraisalFilters): Promise<StockAppraisal[]>
}
```

## Algoritmos de Cálculo

### 1. Custo da Receita
```typescript
function calculateRecipeCost(recipe: Recipe): RecipeCost {
  let totalCost = 0;
  
  for (const item of recipe.ingredients) {
    const ingredient = await getIngredient(item.ingredientId);
    const cost = convertUnit(item.quantity, item.unit, ingredient.unit) * ingredient.averageCost;
    totalCost += cost;
  }
  
  const costPerPortion = totalCost / recipe.yield;
  
  return {
    totalCost,
    costPerPortion,
    ingredients: recipe.ingredients.map(item => ({
      ...item,
      cost: calculateIngredientCost(item)
    }))
  };
}
```

### 2. Preço Sugerido
```typescript
function calculateSuggestedPrice(cost: number, targetMargin: number): number {
  // Preço = Custo / (1 - Margem)
  // Exemplo: Custo R$ 10, Margem 65% = R$ 10 / 0.35 = R$ 28.57
  return cost / (1 - targetMargin / 100);
}
```

### 3. CMV do Período
```typescript
function calculatePeriodCMV(period: CMVPeriod): CMVCalculation {
  // CMV = Estoque Inicial + Compras - Estoque Final
  const cmv = period.openingStock + period.purchases - period.closingStock;
  const cmvPercentage = (cmv / period.revenue) * 100;
  
  return {
    cmv,
    cmvPercentage,
    margin: 100 - cmvPercentage
  };
}
```

### 4. Acuracidade de Estoque
```typescript
function calculateAccuracy(appraisal: StockAppraisal): number {
  let totalTheoretical = 0;
  let totalDifference = 0;
  
  for (const item of appraisal.items) {
    const theoreticalValue = item.theoreticalQuantity * item.unitCost;
    const difference = Math.abs(item.difference * item.unitCost);
    
    totalTheoretical += theoreticalValue;
    totalDifference += difference;
  }
  
  const accuracy = (1 - totalDifference / totalTheoretical) * 100;
  return Math.max(0, accuracy);
}
```

## Frontend - Componentes

### RecipeFormPage
- Formulário de criação/edição de receita
- Lista de ingredientes com busca
- Cálculo automático de custos
- Preview de custo por porção

### ProductFormPage
- Formulário de produto
- Seleção de receita
- Definição de margem desejada
- Cálculo de preço sugerido
- Simulador de preços

### CMVDashboardPage
- KPIs principais (CMV%, Margem, Receita)
- Gráfico de evolução de CMV
- Top produtos rentáveis/não rentáveis
- Alertas e recomendações

### AppraisalPage
- Lista de ingredientes para contagem
- Input de quantidade física
- Comparação teórico vs físico
- Justificativa de divergências

### ProfitabilityAnalysisPage
- Análise detalhada por produto
- Comparação de margens
- Sugestões de ajuste de preço
- Histórico de custos

## Testes

### Testes Unitários
- Cálculo de custos de receita
- Cálculo de preço sugerido
- Cálculo de CMV
- Cálculo de acuracidade

### Testes de Integração
- Criar receita com ingredientes
- Atualizar custo ao mudar ingrediente
- Fechar período de CMV
- Aprovar apuração

### Testes E2E
- Fluxo completo de criação de produto
- Fluxo de apuração de estoque
- Fluxo de fechamento de CMV

## Performance

### Otimizações
- Cache de cálculos de receitas (Redis)
- Índices em campos de busca
- Paginação em listagens
- Cálculo assíncrono de CMV
- Agregações no banco

### Monitoramento
- Tempo de cálculo de CMV
- Tempo de resposta de APIs
- Taxa de erro em cálculos
- Uso de cache

## Segurança

### Validações
- Margem entre 0-100%
- Preço > Custo
- Quantidades > 0
- Datas válidas

### Auditoria
- Log de alterações de preço
- Log de ajustes de estoque
- Log de fechamento de CMV
- Histórico de versões de receitas
