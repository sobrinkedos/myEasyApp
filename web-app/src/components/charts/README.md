# Componentes de Gráficos

Componentes de gráficos responsivos construídos com Recharts, com suporte a tema claro/escuro e tooltips customizados.

## Componentes Disponíveis

### LineChart

Gráfico de linha para visualizar tendências ao longo do tempo.

**Props:**
- `data`: Array de objetos com os dados
- `lines`: Array de configurações de linha (dataKey, name, color, strokeWidth)
- `xAxisKey`: Chave para o eixo X
- `height`: Altura do gráfico (padrão: 300)
- `showGrid`: Mostrar grade (padrão: true)
- `showLegend`: Mostrar legenda (padrão: true)
- `showTooltip`: Mostrar tooltip (padrão: true)
- `curved`: Linhas curvas (padrão: true)
- `className`: Classes CSS adicionais

**Exemplo:**
```tsx
<LineChart
  data={salesData}
  lines={[
    { dataKey: 'vendas', name: 'Vendas (R$)', color: '#f97316' },
    { dataKey: 'pedidos', name: 'Pedidos', color: '#3b82f6' },
  ]}
  xAxisKey="month"
  height={300}
/>
```

### BarChart

Gráfico de barras para comparar valores entre categorias.

**Props:**
- `data`: Array de objetos com os dados
- `bars`: Array de configurações de barra (dataKey, name, color, stackId)
- `xAxisKey`: Chave para o eixo X
- `height`: Altura do gráfico (padrão: 300)
- `showGrid`: Mostrar grade (padrão: true)
- `showLegend`: Mostrar legenda (padrão: true)
- `showTooltip`: Mostrar tooltip (padrão: true)
- `horizontal`: Orientação horizontal (padrão: false)
- `stacked`: Barras empilhadas (padrão: false)
- `className`: Classes CSS adicionais

**Exemplo:**
```tsx
<BarChart
  data={categoryData}
  bars={[
    { dataKey: 'value', name: 'Vendas (R$)', color: '#10b981' },
  ]}
  xAxisKey="category"
  height={300}
/>
```

### PieChart

Gráfico de pizza/rosca para visualizar proporções.

**Props:**
- `data`: Array de objetos com name e value
- `height`: Altura do gráfico (padrão: 300)
- `showLegend`: Mostrar legenda (padrão: true)
- `showTooltip`: Mostrar tooltip (padrão: true)
- `showLabels`: Mostrar labels com percentual (padrão: true)
- `innerRadius`: Raio interno para gráfico de rosca (padrão: 0)
- `outerRadius`: Raio externo (padrão: 80)
- `colors`: Array de cores customizadas
- `className`: Classes CSS adicionais

**Exemplo:**
```tsx
<PieChart
  data={paymentData}
  height={350}
  innerRadius={60} // Para gráfico de rosca
/>
```

### SparklineChart

Gráfico minimalista de linha para uso em cards de métricas. Versão simplificada sem eixos, grade ou tooltips.

**Props:**
- `data`: Array de objetos com value
- `dataKey`: Chave dos dados (padrão: 'value')
- `color`: Cor da linha (opcional, usa cor baseada em trend se não fornecida)
- `height`: Altura do gráfico (padrão: 40)
- `width`: Largura do gráfico (padrão: '100%')
- `strokeWidth`: Espessura da linha (padrão: 2)
- `trend`: Tendência para cor automática: 'up' (verde), 'down' (vermelho), 'neutral' (azul)
- `className`: Classes CSS adicionais

**Exemplo:**
```tsx
<SparklineChart
  data={sparklineData}
  trend="up"
  height={50}
/>
```

**Uso em Cards de Métricas:**
```tsx
<div className="bg-white rounded-lg p-4">
  <div className="flex items-start justify-between mb-2">
    <div>
      <p className="text-sm text-neutral-600">Vendas do Mês</p>
      <p className="text-2xl font-bold">R$ 45.230</p>
    </div>
    <span className="text-sm font-medium text-success">+12.5%</span>
  </div>
  <SparklineChart
    data={sparklineData}
    trend="up"
    height={50}
  />
</div>
```

## Cores Padrão

Os componentes usam uma paleta de cores consistente:
- `#f97316` - Primary (Laranja)
- `#3b82f6` - Secondary (Azul)
- `#10b981` - Success (Verde)
- `#f59e0b` - Warning (Amarelo)
- `#ef4444` - Error (Vermelho)
- `#8b5cf6` - Purple (Roxo)
- `#ec4899` - Pink (Rosa)
- `#06b6d4` - Cyan (Ciano)

## Tema

Todos os componentes se adaptam automaticamente ao tema claro/escuro usando o hook `useTheme()`. As cores dos eixos, grade e tooltips são ajustadas conforme o tema ativo.

## Responsividade

Todos os gráficos são responsivos e se adaptam ao tamanho do container usando `ResponsiveContainer` do Recharts.

## Tooltips

Tooltips customizados são implementados para todos os gráficos, mostrando:
- Label/categoria
- Nome da série
- Valor formatado (com separador de milhares)
- Cor da série

## Formatação

- Valores numéricos são formatados com `toLocaleString('pt-BR')`
- Percentuais são exibidos com 1 casa decimal
- Eixos Y formatam valores automaticamente

## Exemplo Completo

Veja `ChartsExample.tsx` para exemplos de uso de todos os componentes com diferentes configurações.
