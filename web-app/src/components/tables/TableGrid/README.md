# TableGrid

Componente de grid visual para gerenciamento de mesas com indicadores de status, informações de ocupação e ações rápidas.

## Características

- **Grid Responsivo**: Adapta-se de 2 a 5 colunas conforme o tamanho da tela
- **4 Status de Mesa**: Disponível, Ocupada, Reservada, Em Limpeza
- **Cores Semânticas**: Verde, vermelho, azul e amarelo para cada status
- **Estatísticas**: Resumo visual de mesas por status
- **Informações Detalhadas**: Comanda, tempo de ocupação, valor total
- **Ações Rápidas**: Botões contextuais por status
- **Animações**: Entrada suave com stagger effect
- **Tema**: Suporte completo a tema claro/escuro

## Props

### TableGrid

```typescript
interface TableGridProps {
  tables: Table[];
  onTableClick?: (table: Table) => void;
  onOpenCommand?: (table: Table) => void;
  onCleanTable?: (table: Table) => void;
  onReserveTable?: (table: Table) => void;
  loading?: boolean;
}
```

- `tables` (array, obrigatório): Lista de mesas
- `onTableClick` (function, opcional): Callback quando mesa é clicada
- `onOpenCommand` (function, opcional): Callback para abrir/ver comanda
- `onCleanTable` (function, opcional): Callback para marcar mesa como limpa
- `onReserveTable` (function, opcional): Callback para reservar mesa
- `loading` (boolean, opcional): Estado de carregamento (padrão: false)

### Table

```typescript
interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  commandId?: string;
  commandNumber?: string;
  occupiedSince?: Date;
  reservedFor?: string;
  totalAmount?: number;
}

type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
```

## Uso

### Básico

```tsx
import { TableGrid, Table } from '@/components/tables';

function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);

  const handleTableClick = (table: Table) => {
    console.log('Table clicked:', table);
  };

  const handleOpenCommand = async (table: Table) => {
    if (table.status === 'available') {
      // Abrir nova comanda
      await api.post('/commands', { tableId: table.id });
    } else if (table.status === 'occupied') {
      // Ver comanda existente
      navigate(`/commands/${table.commandId}`);
    }
  };

  const handleCleanTable = async (table: Table) => {
    await api.patch(`/tables/${table.id}`, { status: 'available' });
    loadTables();
  };

  const handleReserveTable = async (table: Table) => {
    const name = prompt('Nome da reserva:');
    if (name) {
      await api.patch(`/tables/${table.id}`, {
        status: 'reserved',
        reservedFor: name,
      });
      loadTables();
    }
  };

  return (
    <TableGrid
      tables={tables}
      onTableClick={handleTableClick}
      onOpenCommand={handleOpenCommand}
      onCleanTable={handleCleanTable}
      onReserveTable={handleReserveTable}
    />
  );
}
```

### Com Loading

```tsx
<TableGrid
  tables={tables}
  loading={isLoading}
  onTableClick={handleTableClick}
  onOpenCommand={handleOpenCommand}
/>
```

### Com Filtros

```tsx
function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [filter, setFilter] = useState<TableStatus | 'all'>('all');

  const filteredTables = tables.filter(table => {
    if (filter === 'all') return true;
    return table.status === filter;
  });

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Button onClick={() => setFilter('all')}>Todas</Button>
        <Button onClick={() => setFilter('available')}>Disponíveis</Button>
        <Button onClick={() => setFilter('occupied')}>Ocupadas</Button>
        <Button onClick={() => setFilter('reserved')}>Reservadas</Button>
        <Button onClick={() => setFilter('cleaning')}>Em Limpeza</Button>
      </div>
      <TableGrid
        tables={filteredTables}
        onTableClick={handleTableClick}
        onOpenCommand={handleOpenCommand}
        onCleanTable={handleCleanTable}
        onReserveTable={handleReserveTable}
      />
    </div>
  );
}
```

## Status de Mesa

### 1. Disponível (available)
- **Cor**: Verde
- **Ícone**: ✓
- **Ações**: Abrir Comanda, Reservar
- **Informações**: Capacidade

### 2. Ocupada (occupied)
- **Cor**: Vermelho
- **Ícone**: ●
- **Ações**: Ver Comanda
- **Informações**: 
  - Número da comanda
  - Tempo de ocupação
  - Valor total

### 3. Reservada (reserved)
- **Cor**: Azul
- **Ícone**: 🔒
- **Ações**: Ver Detalhes
- **Informações**:
  - Nome do cliente
  - Capacidade

### 4. Em Limpeza (cleaning)
- **Cor**: Amarelo
- **Ícone**: ✨
- **Ações**: Marcar Limpa
- **Informações**: Status de limpeza

## Estatísticas

O componente exibe automaticamente um resumo com:
- Total de mesas disponíveis (verde)
- Total de mesas ocupadas (vermelho)
- Total de mesas reservadas (azul)
- Total de mesas em limpeza (amarelo)

## TableCard

Cada card de mesa exibe:

### Header
- Número da mesa (grande e destacado)
- Capacidade (ícone de pessoas)
- Badge de status (colorido)

### Informações (conforme status)
- **Ocupada**: Comanda, tempo, valor
- **Reservada**: Nome do cliente
- **Limpeza**: Status de limpeza

### Ações Rápidas
- Botões contextuais baseados no status
- Cores semânticas
- Largura completa

## Responsividade

- **Mobile (< 640px)**: 2 colunas
- **Tablet (640px - 1024px)**: 3 colunas
- **Desktop (1024px - 1280px)**: 4 colunas
- **Large Desktop (> 1280px)**: 5 colunas

## Animações

- Entrada suave com fade + scale
- Stagger effect (delay progressivo)
- Hover com elevação
- Transições de cor suaves

## Exemplo de Dados

```typescript
const tables: Table[] = [
  {
    id: '1',
    number: '1',
    capacity: 4,
    status: 'available',
  },
  {
    id: '2',
    number: '2',
    capacity: 2,
    status: 'occupied',
    commandId: 'cmd-123',
    commandNumber: '045',
    occupiedSince: new Date(Date.now() - 3600000), // 1 hora atrás
    totalAmount: 125.50,
  },
  {
    id: '3',
    number: '3',
    capacity: 6,
    status: 'reserved',
    reservedFor: 'João Silva',
  },
  {
    id: '4',
    number: '4',
    capacity: 4,
    status: 'cleaning',
  },
];

<TableGrid
  tables={tables}
  onTableClick={(table) => console.log('Clicked:', table)}
  onOpenCommand={(table) => console.log('Open command:', table)}
  onCleanTable={(table) => console.log('Clean:', table)}
  onReserveTable={(table) => console.log('Reserve:', table)}
/>
```

## Integração com API

```typescript
// Carregar mesas
const loadTables = async () => {
  const response = await api.get('/tables');
  setTables(response.data);
};

// Abrir comanda
const handleOpenCommand = async (table: Table) => {
  if (table.status === 'available') {
    const response = await api.post('/commands', {
      tableId: table.id,
    });
    navigate(`/commands/${response.data.id}`);
  } else if (table.commandId) {
    navigate(`/commands/${table.commandId}`);
  }
};

// Limpar mesa
const handleCleanTable = async (table: Table) => {
  await api.patch(`/tables/${table.id}/status`, {
    status: 'available',
  });
  loadTables();
};

// Reservar mesa
const handleReserveTable = async (table: Table) => {
  const name = prompt('Nome da reserva:');
  if (name) {
    await api.patch(`/tables/${table.id}/reserve`, {
      reservedFor: name,
    });
    loadTables();
  }
};
```

## Dependências

- `date-fns`: Formatação de tempo decorrido
- `framer-motion`: Animações de entrada
- `lucide-react`: Ícones

## Acessibilidade

- Navegação por teclado
- Indicadores visuais de foco
- Labels descritivos
- Contraste adequado de cores

## Performance

- Animações otimizadas com stagger
- Skeleton loading durante carregamento
- Memoização de componentes

## Exemplo Completo

Veja o arquivo `TablesPage.tsx` para um exemplo completo de integração com API e gerenciamento de estado.
