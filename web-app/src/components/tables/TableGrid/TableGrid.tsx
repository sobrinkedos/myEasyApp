import { TableCard } from './TableCard';
import { motion } from 'framer-motion';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface Table {
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

interface TableGridProps {
  tables: Table[];
  onTableClick?: (table: Table) => void;
  loading?: boolean;
}

export const TableGrid = ({
  tables,
  onTableClick,
  loading = false,
}: TableGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-neutral-400">
          Nenhuma mesa cadastrada
        </p>
      </div>
    );
  }

  // Agrupar mesas por status para estatísticas
  const stats = {
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    cleaning: tables.filter((t) => t.status === 'cleaning').length,
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-success/10 dark:bg-success/20 rounded-lg p-4 border border-success/20">
          <p className="text-sm text-success mb-1">Disponíveis</p>
          <p className="text-2xl font-bold text-success">{stats.available}</p>
        </div>
        <div className="bg-error/10 dark:bg-error/20 rounded-lg p-4 border border-error/20">
          <p className="text-sm text-error mb-1">Ocupadas</p>
          <p className="text-2xl font-bold text-error">{stats.occupied}</p>
        </div>
        <div className="bg-info/10 dark:bg-info/20 rounded-lg p-4 border border-info/20">
          <p className="text-sm text-info mb-1">Reservadas</p>
          <p className="text-2xl font-bold text-info">{stats.reserved}</p>
        </div>
        <div className="bg-warning/10 dark:bg-warning/20 rounded-lg p-4 border border-warning/20">
          <p className="text-sm text-warning mb-1">Em Limpeza</p>
          <p className="text-2xl font-bold text-warning">{stats.cleaning}</p>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map((table, index) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
          >
            <TableCard
              table={table}
              onClick={() => onTableClick?.(table)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
