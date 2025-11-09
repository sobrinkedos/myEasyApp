import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableService, Table as ServiceTable } from '../../services/table.service';
import TableFormModal from './TableFormModal';
import { TableGrid, Table as GridTable } from '../../components/tables';
import { TableManagementModal } from '../../components/tables/TableManagementModal';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Plus, Settings } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { TableStatus } from '../../components/tables/TableGrid/TableGrid';

export default function TablesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tables, setTables] = useState<ServiceTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<GridTable | null>(null);

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
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    loadTables();
  };

  const handleTableClick = (table: GridTable) => {
    setSelectedTable(table);
    setShowManagementModal(true);
  };

  const handleStatusChange = async (newStatus: TableStatus) => {
    if (!selectedTable) return;

    try {
      await tableService.update(selectedTable.id, { status: newStatus });
      toast.success(`Status da mesa ${selectedTable.number} alterado para ${newStatus}`);
      loadTables();
      setShowManagementModal(false);
      setSelectedTable(null);
    } catch (error) {
      console.error('Erro ao alterar status da mesa:', error);
      toast.error('Erro ao alterar status da mesa');
      throw error;
    }
  };

  const handleViewHistory = () => {
    if (!selectedTable) return;
    toast.info('Funcionalidade de histórico em desenvolvimento');
    // TODO: Implementar visualização de histórico
  };

  const handleOpenCommand = () => {
    if (!selectedTable) return;
    
    // Fechar o modal e redirecionar para criação de comanda
    setShowManagementModal(false);
    navigate(`/commands/new?tableId=${selectedTable.id}`);
  };

  const handleViewOrders = () => {
    if (!selectedTable) return;
    
    if (selectedTable.commandId) {
      // Redirecionar para página da comanda onde estão os pedidos
      navigate(`/commands/${selectedTable.commandId}`);
    } else {
      toast.warning('Nenhuma comanda encontrada para esta mesa');
    }
  };

  const handleCloseService = () => {
    if (!selectedTable) return;
    
    if (selectedTable.commandId) {
      // Redirecionar para página de pagamento da comanda
      navigate(`/cash/commands/${selectedTable.commandId}/payment`);
    } else {
      toast.warning('Nenhuma comanda encontrada para esta mesa');
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
      />

      {showFormModal && (
        <TableFormModal
          table={null}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {showManagementModal && selectedTable && (
        <TableManagementModal
          isOpen={showManagementModal}
          onClose={() => {
            setShowManagementModal(false);
            setSelectedTable(null);
          }}
          table={selectedTable}
          onStatusChange={handleStatusChange}
          onViewHistory={handleViewHistory}
          onCloseService={handleCloseService}
          onOpenCommand={handleOpenCommand}
          onViewOrders={handleViewOrders}
        />
      )}
    </div>
  );
}
