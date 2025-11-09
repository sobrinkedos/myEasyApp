# KanbanBoard

Componente Kanban Board para gerenciamento visual de pedidos com drag-and-drop entre colunas de status.

## Características

- **4 Colunas de Status**: Pendente, Preparando, Pronto, Entregue
- **Drag-and-Drop**: Arraste pedidos entre colunas para mudar status
- **Indicadores Visuais**: Cores semânticas para cada status
- **Prioridade**: Badges coloridos para pedidos de alta prioridade
- **Tempo Decorrido**: Mostra há quanto tempo o pedido foi criado
- **Informações Completas**: Número do pedido, mesa, itens, valor total
- **Notas**: Destaque visual para observações importantes
- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Tema**: Suporte completo a tema claro/escuro

## Props

### KanbanBoard

```typescript
interface KanbanBoardProps {
  orders: Order[];
  onOrderMove: (orderId: string, newStatus: OrderStatus) => void;
  onOrderClick?: (order: Order) => void;
}
```

- `orders` (array, obrigatório): Lista de pedidos
- `onOrderMove` (function, obrigatório): Callback quando um pedido muda de status
- `onOrderClick` (function, opcional): Callback quando um pedido é clicado

### Order

```typescript
interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  totalAmount: number;
  createdAt: Date;
  priority?: 'low' | 'normal' | 'high';
  notes?: string;
  status: OrderStatus;
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';
```

## Uso

### Básico

```tsx
import { KanbanBoard, Order } from '@/components/orders';

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const handleOrderMove = async (orderId: string, newStatus: OrderStatus) => {
    // Atualizar status no backend
    await api.patch(`/orders/${orderId}`, { status: newStatus });
    
    // Atualizar estado local
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleOrderClick = (order: Order) => {
    // Abrir modal com detalhes do pedido
    console.log('Order clicked:', order);
  };

  return (
    <KanbanBoard
      orders={orders}
      onOrderMove={handleOrderMove}
      onOrderClick={handleOrderClick}
    />
  );
}
```

### Com Filtros

```tsx
function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'high-priority'>('all');

  const filteredOrders = orders.filter(order => {
    if (filter === 'high-priority') {
      return order.priority === 'high';
    }
    return true;
  });

  return (
    <div>
      <div className="mb-4">
        <Button onClick={() => setFilter('all')}>Todos</Button>
        <Button onClick={() => setFilter('high-priority')}>Alta Prioridade</Button>
      </div>
      <KanbanBoard
        orders={filteredOrders}
        onOrderMove={handleOrderMove}
        onOrderClick={handleOrderClick}
      />
    </div>
  );
}
```

## Colunas

O Kanban possui 4 colunas fixas:

1. **Pendente** (pending)
   - Cor: Cinza neutro
   - Pedidos recém-criados aguardando preparo

2. **Preparando** (preparing)
   - Cor: Amarelo (warning)
   - Pedidos em processo de preparação

3. **Pronto** (ready)
   - Cor: Verde (success)
   - Pedidos prontos para entrega

4. **Entregue** (delivered)
   - Cor: Azul (info)
   - Pedidos já entregues ao cliente

## OrderCard

Cada card de pedido exibe:

- **Número do Pedido**: Identificador único
- **Mesa**: Número da mesa (se aplicável)
- **Itens**: Lista dos primeiros 3 itens (+ contador se houver mais)
- **Prioridade**: Badge colorido (apenas se não for normal)
- **Notas**: Observações importantes com destaque visual
- **Tempo**: Há quanto tempo o pedido foi criado
- **Valor Total**: Valor total do pedido

### Prioridades

- **Alta** (high): Badge vermelho
- **Normal** (normal): Sem badge
- **Baixa** (low): Badge cinza

## Drag-and-Drop

### Como Funciona

1. Clique e segure em um card de pedido
2. Arraste para a coluna desejada
3. Solte para mover o pedido
4. O callback `onOrderMove` é chamado com o novo status

### Feedback Visual

- Card em arrasto fica semi-transparente e rotacionado
- Coluna de destino fica destacada com borda azul
- Overlay mostra preview do card sendo arrastado

## Responsividade

- **Desktop (lg+)**: 4 colunas lado a lado
- **Tablet (md)**: 2 colunas em 2 linhas
- **Mobile**: 1 coluna por vez (scroll vertical)

## Acessibilidade

- Navegação por teclado completa
- Suporte a leitores de tela
- Indicadores visuais de foco
- Labels descritivos

## Integração com API

```typescript
// Exemplo de integração com backend
const handleOrderMove = async (orderId: string, newStatus: OrderStatus) => {
  try {
    // Atualizar no backend
    await api.patch(`/orders/${orderId}/status`, { status: newStatus });
    
    // Atualizar estado local
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    // Mostrar notificação
    showToast('Pedido atualizado com sucesso', 'success');
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    showToast('Erro ao atualizar pedido', 'error');
    
    // Reverter mudança local se falhar
    loadOrders();
  }
};
```

## Dependências

- `@dnd-kit/core`: Funcionalidade de drag-and-drop
- `@dnd-kit/sortable`: Ordenação de listas
- `@dnd-kit/utilities`: Utilitários para transformações CSS
- `date-fns`: Formatação de datas e tempo decorrido
- `framer-motion`: Animações suaves

## Performance

- Otimizado para listas grandes com virtualização
- Memoização de componentes para evitar re-renders desnecessários
- Atualizações locais otimistas para UX fluida

## Exemplo Completo

Veja o arquivo `OrdersListPage.tsx` para um exemplo completo de integração com API e gerenciamento de estado.
