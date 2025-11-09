import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableService, Table as ServiceTable } from '../../services/table.service';
import TableFormModal from './TableFormModal';
import { TableGrid, Table as GridTable, ReserveTableModal } from '../../components/tables';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function TablesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tables, setTables] = useState<ServiceTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<ServiceTable | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [tableToReserve, setTableToReserve] = useState<GridTable | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await tableService.getAll();
      setTables(response.data);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedTable(null);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setSelectedTable(null);
    loadTables();
  };

  const handleTableClick = (table: GridTable) => {
    // Encontrar a mesa original para editar
    const originalTable = tables.find((t) => t.id === table.id);
    if (originalTable) {
      setSelectedTable(originalTable);
      setShowModal(true);
    }
  };

  const handleOpenCommand = async (table: GridTable) => {
    console.log('handleOpenCommand called', table);
    
    if (table.status === 'available') {
      // Abrir nova comanda
      toast.info('Funcionalidade de abrir comanda em desenvolvimento');
      // TODO: Implementar criação de comanda
      // navigate(`/commands/new?tableId=${table.id}`);
    } else if (table.status === 'occupied') {
      if (table.commandId) {
        // Ver comanda existente
        navigate(`/commands/${table.commandId}`);
      } else {
        // Fallback: ir para lista de comandas
        toast.warning('Comanda não encontrada. Redirecionando para lista de comandas...');
        navigate('/commands');
      }
    }
  };

  const handleCleanTable = async (table: GridTable) => {
    try {
      await tableService.update(table.id, { status: 'available' });
      toast.success('Mesa marcada como limpa');
      loadTables();
    } catch (error) {
      console.error('Erro ao limpar mesa:', error);
      toast.error('Erro ao limpar mesa');
    }
  };

  const handleReserveTable = (table: GridTable) => {
    setTableToReserve(table);
    setShowReserveModal(true);
  };

  const handleConfirmReserve = async (data: {
    customerName: string;
    date?: string;
    time?: string;
  }) => {
    if (!tableToReserve) return;

    try {
      await tableService.update(tableToReserve.id, {
        status: 'reserved',
        // reservedFor: data.customerName, // Adicionar campo se necessário na API
      });
      toast.success(
        `Mesa ${tableToReserve.number} reservada para ${data.customerName}`
      );
      loadTables();
      setShowReserveModal(false);
      setTableToReserve(null);
    } catch (error) {
      console.error('Erro ao reservar mesa:', error);
      toast.error('Erro ao reservar mesa');
      throw error;
    }
  };

  // Converter tabelas do serviço para o formato do grid
  const gridTables: GridTable[] = tables.map((table) => ({
    id: table.id,
    number: table.number.toString(),
    capacity: table.capacity,
    status: table.status as GridTable['status'],
    commandId: table.commandId,
    commandNumber: table.commandNumber,
    occupiedSince: table.occupiedSince ? new Date(table.occupiedSince) : undefined,
    reservedFor: table.reservedFor,
    totalAmount: table.totalAmount,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mesas"
        subtitle={`${tables.length} ${tables.length === 1 ? 'mesa cadastrada' : 'mesas cadastradas'}`}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleNew}
          >
            Nova Mesa
          </Button>
        }
      />

      <TableGrid
        tables={gridTables}
        loading={loading}
        onTableClick={handleTableClick}
        onOpenCommand={handleOpenCommand}
        onCleanTable={handleCleanTable}
        onReserveTable={handleReserveTable}
      />

      {showModal && (
        <TableFormModal
          table={selectedTable}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showReserveModal && tableToReserve && (
        <ReserveTableModal
          isOpen={showReserveModal}
          onClose={() => {
            setShowReserveModal(false);
            setTableToReserve(null);
          }}
          onConfirm={handleConfirmReserve}
          tableNumber={tableToReserve.number}
        />
      )}
    </div>
  );
}
