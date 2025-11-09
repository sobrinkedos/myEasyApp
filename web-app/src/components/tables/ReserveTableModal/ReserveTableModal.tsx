import { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { User } from 'lucide-react';

interface ReserveTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { customerName: string; date?: string; time?: string }) => void;
  tableNumber: string;
}

export const ReserveTableModal = ({
  isOpen,
  onClose,
  onConfirm,
  tableNumber,
}: ReserveTableModalProps) => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setLoading(true);
    try {
      await onConfirm({ customerName, date, time });
      handleClose();
    } catch (error) {
      console.error('Erro ao reservar mesa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setDate('');
    setTime('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Reservar Mesa {tableNumber}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Preencha os dados da reserva
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Cliente"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Digite o nome do cliente"
            prefixIcon={<User className="w-4 h-4" />}
            required
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Data (opcional)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Horário (opcional)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!customerName.trim()}
            >
              Confirmar Reserva
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
