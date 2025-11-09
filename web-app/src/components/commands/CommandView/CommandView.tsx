import { useState } from 'react';
import {
  X,
  User,
  Clock,
  DollarSign,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  History,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface CommandItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}

export interface CommandPayment {
  id: string;
  method: 'cash' | 'credit' | 'debit' | 'pix';
  amount: number;
  timestamp: Date;
}

export interface Command {
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

const PAYMENT_METHODS = {
  cash: { label: 'Dinheiro', icon: Banknote, color: 'text-success' },
  credit: { label: 'Cartão Crédito', icon: CreditCard, color: 'text-info' },
  debit: { label: 'Cartão Débito', icon: CreditCard, color: 'text-secondary-500' },
  pix: { label: 'PIX', icon: Smartphone, color: 'text-primary-500' },
};

export const CommandView = ({
  command,
  onClose,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onAddPayment,
  onCloseCommand,
  readonly = false,
}: CommandViewProps) => {
  const [activeTab, setActiveTab] = useState<'items' | 'payments' | 'history'>('items');

  const paidAmount = command.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = command.total - paidAmount;
  const isFullyPaid = remainingAmount <= 0;

  const getStatusColor = () => {
    switch (command.status) {
      case 'open':
        return 'success';
      case 'closed':
        return 'neutral';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = () => {
    switch (command.status) {
      case 'open':
        return 'Aberta';
      case 'closed':
        return 'Fechada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return command.status;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Comanda #{command.commandNumber}
            </h2>
            <Badge variant="soft" color={getStatusColor()}>
              {getStatusLabel()}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {command.tableNumber && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Mesa {command.tableNumber}</span>
              </div>
            )}
            {command.customerName && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{command.customerName}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(command.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" icon={<X className="w-5 h-5" />} onClick={onClose} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700 px-6">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'items'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          Itens ({command.items.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          Pagamentos ({command.payments.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          Histórico
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'items' && (
          <div className="space-y-3">
            {command.items.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum item na comanda</p>
              </div>
            ) : (
              command.items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          {item.productName}
                        </h4>
                        <Badge
                          variant="soft"
                          color={
                            item.status === 'delivered'
                              ? 'success'
                              : item.status === 'ready'
                              ? 'info'
                              : item.status === 'preparing'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {item.status === 'delivered'
                            ? 'Entregue'
                            : item.status === 'ready'
                            ? 'Pronto'
                            : item.status === 'preparing'
                            ? 'Preparando'
                            : 'Pendente'}
                        </Badge>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {item.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          R$ {item.unitPrice.toFixed(2)} x {item.quantity}
                        </span>
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                          R$ {item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {!readonly && command.status === 'open' && (
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Minus className="w-4 h-4" />}
                          onClick={() => onUpdateQuantity?.(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        />
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Plus className="w-4 h-4" />}
                          onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => onRemoveItem?.(item.id)}
                          className="text-error hover:bg-error/10 ml-2"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
            {!readonly && command.status === 'open' && onAddItem && (
              <Button
                variant="outline"
                fullWidth
                icon={<Plus className="w-4 h-4" />}
                onClick={onAddItem}
              >
                Adicionar Item
              </Button>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3">
            {command.payments.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum pagamento registrado</p>
              </div>
            ) : (
              command.payments.map((payment) => {
                const method = PAYMENT_METHODS[payment.method];
                const Icon = method.icon;
                return (
                  <Card key={payment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center ${method.color}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {method.label}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {formatDistanceToNow(new Date(payment.timestamp), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-success">
                        R$ {payment.amount.toFixed(2)}
                      </span>
                    </div>
                  </Card>
                );
              })
            )}
            {!readonly && command.status === 'open' && onAddPayment && (
              <Button
                variant="outline"
                fullWidth
                icon={<Plus className="w-4 h-4" />}
                onClick={onAddPayment}
              >
                Adicionar Pagamento
              </Button>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Histórico de alterações</p>
              <p className="text-sm mt-1">Em desenvolvimento</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Totais */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 p-6 space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
            <span className="font-medium">R$ {command.subtotal.toFixed(2)}</span>
          </div>
          {command.serviceCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Taxa de Serviço</span>
              <span className="font-medium">R$ {command.serviceCharge.toFixed(2)}</span>
            </div>
          )}
          {command.discount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Desconto</span>
              <span className="font-medium">- R$ {command.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <span>Total</span>
            <span className="text-primary-600 dark:text-primary-400">
              R$ {command.total.toFixed(2)}
            </span>
          </div>
          {paidAmount > 0 && (
            <>
              <div className="flex justify-between text-sm text-success">
                <span>Pago</span>
                <span className="font-medium">R$ {paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Restante</span>
                <span className={remainingAmount > 0 ? 'text-error' : 'text-success'}>
                  R$ {Math.max(0, remainingAmount).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        {!readonly && command.status === 'open' && onCloseCommand && (
          <Button
            variant="primary"
            fullWidth
            size="lg"
            disabled={!isFullyPaid}
            onClick={onCloseCommand}
          >
            {isFullyPaid ? 'Fechar Comanda' : 'Aguardando Pagamento'}
          </Button>
        )}
      </div>
    </div>
  );
};
