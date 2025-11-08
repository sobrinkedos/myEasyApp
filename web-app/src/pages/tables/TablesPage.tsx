import { useState, useEffect } from 'react';
import { tableService, Table } from '../../services/table.service';
import TableFormModal from './TableFormModal';

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

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

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setShowModal(true);
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

  const handleDelete = async (table: Table) => {
    if (!window.confirm(`Deseja realmente remover a mesa ${table.number}?`)) return;

    try {
      await tableService.delete(table.id);
      loadTables();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao remover mesa');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disponível' },
      occupied: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ocupada' },
      reserved: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Reservada' },
    };
    const badge = badges[status as keyof typeof badges] || badges.available;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={handleNew}
        >
          Nova Mesa
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {table.number}
              </div>
              <div className="mb-3">
                {getStatusBadge(table.status)}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Capacidade: {table.capacity} pessoas
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleEdit(table)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(table)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TableFormModal
          table={selectedTable}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {tables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma mesa cadastrada</p>
        </div>
      )}
    </div>
  );
}
