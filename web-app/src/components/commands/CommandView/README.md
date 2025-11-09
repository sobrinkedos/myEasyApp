# CommandView

Componente de visualização detalhada de comanda com lista de itens, pagamentos, histórico e opções de gerenciamento.

## Características

- **3 Tabs**: Itens, Pagamentos e Histórico
- **Lista de Itens**: Visualização completa com status, quantidade e preços
- **Gerenciamento**: Adicionar/remover itens, ajustar quantidades
- **Pagamentos**: Registro de múltiplos métodos de pagamento
- **Cálculos Automáticos**: Subtotal, taxa de serviço, desconto e total
- **Status Visual**: Badges coloridos para status da comanda e itens
- **Modo Readonly**: Visualização sem edição
- **Responsivo**: Adapta-se a diferentes tamanhos
- **Tema**: Suporte completo a tema claro/escuro

## Props

```typescript
interface CommandViewProps {
  command: Command;
  onClose: () => void;
  onAddItem?: () => void;
  onRemoveItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onAddPayment?: () => void;
  onCloseCommand?: () => void;
  readonly?: boolean;
}
```

- `command` (object, obrigatório): Dados da comanda
- `onClose` (function, obrigatório): Callback para fechar a visualização
- `onAddItem` (function, opcional): Callback para adicionar item
- `onRemoveItem` (function, opcional): Callback para remover item
- `onUpdateQuantity` (function, opcional): Callback para ajustar quantidade
- `onAddPayment` (function, opcional): Callback para adicionar pagamento
- `onCloseCommand` (function, opcional): Callback para fechar comanda
- `readonly` (boolean, opcional): Modo somente leitura (padrão: false)

## Tipos

### Command

```typescript
interface Command {
  id: string;
  commandNumber: string;
  tableNumber?: string;
  customerName?: string;
  items: CommandItem[];
  payments: CommandPayment[];
  subtotal: number;
  serviceCharge: number;
  discount: number;
  total: number;
  status: 'open' | 'closed' | 'cancelled';
  createdAt: Date;
  closedAt?: Date;
}
```

### CommandItem

```typescript
interface CommandItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}
```

### CommandPayment

```typescript
interface CommandPayment {
  id: string;
  method: 'cash' | 'credit' | 'debit' | 'pix';
  amount: number;
  timestamp: Date;
}
```

## Uso

### Como Modal

```tsx
import { CommandView } from '@/components/commands';
import { Modal } from '@/components/ui/Modal';

function CommandModal({ command, isOpen, onClose }) {
  const handleAddItem = () => {
    // Abrir modal de seleção de produtos
  };

  const handleRemoveItem = async (itemId: string) => {
    await api.delete(`/commands/${command.id}/items/${itemId}`);
    // Recarregar comanda
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    await api.patch(`/commands/${command.id}/items/${itemId}`, { quantity });
    // Recarregar comanda
  };

  const handleAddPayment = () => {
    // Abrir modal de pagamento
  };

  const handleCloseCommand = async () => {
    await api.post(`/commands/${command.id}/close`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <CommandView
        command={command}
        onClose={onClose}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onAddPayment={handleAddPayment}
        onCloseCommand={handleCloseCommand}
      />
    </Modal>
  );
}
```

### Como Sidebar

```tsx
import { CommandView } from '@/components/commands';

function CommandSidebar({ command, isOpen, onClose }) {
  return (
    <div
      className={`fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-neutral-900 shadow-2xl transform transition-transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <CommandView
        command={command}
        onClose={onClose}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onAddPayment={handleAddPayment}
        onCloseCommand={handleCloseCommand}
      />
    </div>
  );
}
```

### Modo Readonly

```tsx
<CommandView
  command={command}
  onClose={onClose}
  readonly
/>
```

## Tabs

### 1. Itens

Mostra todos os itens da comanda com:
- Nome do produto
- Status (Pendente, Preparando, Pronto, Entregue)
- Observações
- Quantidade e preço unitário
- Preço total
- Controles de quantidade (+/-)
- Botão de remover

### 2. Pagamentos

Lista todos os pagamentos registrados:
- Método de pagamento (ícone e nome)
- Valor pago
- Timestamp
- Botão para adicionar novo pagamento

### 3. Histórico

Mostra o histórico de alterações da comanda (em desenvolvimento).

## Métodos de Pagamento

- **Dinheiro**: Ícone de nota, cor verde
- **Cartão Crédito**: Ícone de cartão, cor azul
- **Cartão Débito**: Ícone de cartão, cor azul secundário
- **PIX**: Ícone de smartphone, cor laranja

## Cálculos

O componente exibe:
- **Subtotal**: Soma de todos os itens
- **Taxa de Serviço**: Valor adicional (se houver)
- **Desconto**: Valor descontado (se houver)
- **Total**: Valor final a pagar
- **Pago**: Soma de todos os pagamentos
- **Restante**: Diferença entre total e pago

## Status da Comanda

- **Aberta** (open): Badge verde
- **Fechada** (closed): Badge cinza
- **Cancelada** (cancelled): Badge vermelho

## Status dos Itens

- **Pendente** (pending): Badge cinza
- **Preparando** (preparing): Badge amarelo
- **Pronto** (ready): Badge azul
- **Entregue** (delivered): Badge verde

## Validações

- Não permite fechar comanda se não estiver totalmente paga
- Não permite quantidade menor que 1
- Botões de edição desabilitados em modo readonly
- Botões de edição desabilitados se comanda estiver fechada

## Exemplo Completo

```typescript
const command: Command = {
  id: '1',
  commandNumber: '001',
  tableNumber: '5',
  customerName: 'João Silva',
  items: [
    {
      id: '1',
      productName: 'Pizza Margherita',
      quantity: 2,
      unitPrice: 45.00,
      totalPrice: 90.00,
      notes: 'Sem cebola',
      status: 'delivered',
    },
    {
      id: '2',
      productName: 'Refrigerante 2L',
      quantity: 1,
      unitPrice: 12.00,
      totalPrice: 12.00,
      status: 'delivered',
    },
  ],
  payments: [
    {
      id: '1',
      method: 'credit',
      amount: 102.00,
      timestamp: new Date(),
    },
  ],
  subtotal: 102.00,
  serviceCharge: 10.20,
  discount: 0,
  total: 112.20,
  status: 'open',
  createdAt: new Date(Date.now() - 3600000), // 1 hora atrás
};

<CommandView
  command={command}
  onClose={() => console.log('Close')}
  onAddItem={() => console.log('Add item')}
  onRemoveItem={(id) => console.log('Remove', id)}
  onUpdateQuantity={(id, qty) => console.log('Update', id, qty)}
  onAddPayment={() => console.log('Add payment')}
  onCloseCommand={() => console.log('Close command')}
/>
```

## Dependências

- `date-fns`: Formatação de datas e tempo decorrido
- `lucide-react`: Ícones

## Integração com API

Veja exemplos de integração com backend nos exemplos de uso acima.
