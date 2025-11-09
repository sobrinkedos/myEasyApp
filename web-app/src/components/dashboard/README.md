# Componentes de Dashboard

Componentes especializados para construção de dashboards com métricas e visualizações.

## MetricCard

Card de métrica com ícone, valor destacado, variação percentual e gráfico sparkline integrado.

### Props

- `title` (string, obrigatório): Título da métrica
- `value` (string | number, obrigatório): Valor principal da métrica
- `change` (number, opcional): Variação percentual (ex: 12.5 para +12.5%)
- `changeLabel` (string, opcional): Label adicional para a variação (ex: "vs ontem")
- `icon` (LucideIcon, opcional): Ícone do Lucide React
- `iconColor` (string, opcional): Classe Tailwind para cor do ícone (padrão: 'text-primary-500')
- `iconBgColor` (string, opcional): Classe Tailwind para cor de fundo do ícone (padrão: 'bg-primary-100 dark:bg-primary-900/20')
- `sparklineData` (array, opcional): Dados para o gráfico sparkline (formato: `[{ value: number }]`)
- `trend` ('up' | 'down' | 'neutral', opcional): Tendência para determinar cor (detectada automaticamente se não fornecida)
- `loading` (boolean, opcional): Estado de carregamento com skeleton (padrão: false)
- `className` (string, opcional): Classes CSS adicionais

### Características

- **Animações**: Entrada suave com fade + slide, hover com elevação
- **Cores Semânticas**: Verde para tendência positiva, vermelho para negativa, cinza para neutra
- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Tema**: Suporte automático a tema claro/escuro
- **Loading State**: Skeleton animado durante carregamento
- **Sparkline Integrado**: Gráfico minimalista opcional para visualizar tendência

### Exemplos de Uso

#### Card Completo (com tudo)

```tsx
<MetricCard
  title="Vendas do Dia"
  value="R$ 12.450"
  change={12.5}
  changeLabel="vs ontem"
  icon={DollarSign}
  iconColor="text-success"
  iconBgColor="bg-success/10"
  sparklineData={[
    { value: 10 },
    { value: 15 },
    { value: 13 },
    { value: 17 },
    { value: 21 },
  ]}
  trend="up"
/>
```

#### Card Simples (sem sparkline)

```tsx
<MetricCard
  title="Total de Produtos"
  value={245}
  icon={ShoppingCart}
  iconColor="text-primary-500"
  iconBgColor="bg-primary-100 dark:bg-primary-900/20"
/>
```

#### Card Minimalista (sem ícone)

```tsx
<MetricCard
  title="Taxa de Conversão"
  value="68%"
  change={3.5}
  sparklineData={sparklineData}
/>
```

#### Card em Loading

```tsx
<MetricCard
  title="Carregando..."
  value="..."
  loading
  icon={DollarSign}
  sparklineData={sparklineData}
/>
```

### Grid Layout Recomendado

Para dashboards, use um grid responsivo:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <MetricCard {...} />
  <MetricCard {...} />
  <MetricCard {...} />
  <MetricCard {...} />
</div>
```

### Cores de Ícone Recomendadas

Use cores semânticas do design system:

- **Success** (verde): `text-success` / `bg-success/10`
- **Error** (vermelho): `text-error` / `bg-error/10`
- **Warning** (amarelo): `text-warning` / `bg-warning/10`
- **Primary** (laranja): `text-primary-500` / `bg-primary-100 dark:bg-primary-900/20`
- **Secondary** (azul): `text-secondary-500` / `bg-secondary-100 dark:bg-secondary-900/20`

### Ícones Comuns

Ícones do Lucide React recomendados para métricas:

- `DollarSign` - Vendas, receita, valores monetários
- `ShoppingCart` - Pedidos, produtos, compras
- `Users` - Clientes, usuários, mesas
- `TrendingUp` / `TrendingDown` - Tendências, crescimento
- `Package` - Estoque, produtos
- `Clock` - Tempo, duração
- `BarChart3` - Métricas, estatísticas
- `Target` - Metas, objetivos

### Detecção Automática de Tendência

Se `trend` não for fornecida, o componente detecta automaticamente baseado em `change`:
- `change > 0` → trend 'up' (verde)
- `change < 0` → trend 'down' (vermelho)
- `change === 0` ou `undefined` → trend 'neutral' (cinza)

### Formatação de Valores

O componente aceita qualquer formato de valor:
- Números: `245`, `1234`
- Strings formatadas: `"R$ 12.450"`, `"68%"`, `"18/24"`
- A formatação é responsabilidade do componente pai

### Exemplo Completo

Veja `MetricCardExample.tsx` para exemplos completos de uso com diferentes configurações.
