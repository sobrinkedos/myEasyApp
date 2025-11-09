import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { commandService } from '../../services/command.service';
import { tableService, Table } from '../../services/table.service';

export default function NewCommandPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'table' as 'table' | 'counter',
    tableId: '',
    numberOfPeople: 1,
    customerName: '',
    customerPhone: '',
  });

  useEffect(() => {
    loadTables();
    
    // Pré-selecionar mesa se vier da URL
    const tableIdFromUrl = searchParams.get('tableId');
    if (tableIdFromUrl) {
      setFormData(prev => ({ ...prev, tableId: tableIdFromUrl }));
    }
  }, [searchParams]);

  const loadTables = async () => {
    try {
      const response = await tableService.getAll();
      // Incluir mesas disponíveis e a mesa específica se vier da URL
      const tableIdFromUrl = searchParams.get('tableId');
      const availableTables = response.data.filter(
        (t: Table) => t.status === 'available' || t.id === tableIdFromUrl
      );
      setTables(availableTables);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.type === 'table' && !formData.tableId) {
      alert('Selecione uma mesa');
      return;
    }

    try {
      setLoading(true);
      const data = {
        type: formData.type,
        numberOfPeople: formData.numberOfPeople,
        ...(formData.type === 'table' ? { tableId: formData.tableId } : {}),
        ...(formData.type === 'counter' && formData.customerName ? { customerName: formData.customerName } : {}),
        ...(formData.type === 'counter' && formData.customerPhone ? { customerPhone: formData.customerPhone } : {}),
      };

      const response = await commandService.openCommand(data);
      navigate(`/commands/${response.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao abrir comanda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <button
          onClick={() => navigate('/commands')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nova Comanda</h1>
        <p className="text-gray-600 mt-1">Abrir comanda para atendimento em mesa</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6 w-full">
        {/* Mesa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mesa *
          </label>
          <select
            value={formData.tableId}
            onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecione uma mesa</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                Mesa {table.number} (Capacidade: {table.capacity})
              </option>
            ))}
          </select>
          {tables.length === 0 && (
            <p className="mt-2 text-sm text-red-600">
              Nenhuma mesa disponível no momento
            </p>
          )}
        </div>

        {/* Número de Pessoas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Pessoas *
          </label>
          <input
            type="number"
            min="1"
            value={formData.numberOfPeople}
            onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/commands')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Abrindo...' : 'Abrir Comanda'}
          </button>
        </div>
      </form>
    </div>
  );
}
