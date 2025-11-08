import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { commandService } from '../../services/command.service';
import { tableService, Table } from '../../services/table.service';

export default function NewCommandPage() {
  const navigate = useNavigate();
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
  }, []);

  const loadTables = async () => {
    try {
      const response = await tableService.getAll();
      const availableTables = response.data.filter((t: Table) => t.status === 'available');
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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/commands')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nova Comanda</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Atendimento
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'table', tableId: '', customerName: '', customerPhone: '' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.type === 'table'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🪑</div>
                <div className="font-medium">Mesa</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'counter', tableId: '' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.type === 'counter'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🛒</div>
                <div className="font-medium">Balcão</div>
              </div>
            </button>
          </div>
        </div>

        {/* Mesa (se tipo = table) */}
        {formData.type === 'table' && (
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
        )}

        {/* Dados do Cliente (se tipo = counter) */}
        {formData.type === 'counter' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome do cliente (opcional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone do Cliente
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>
          </>
        )}

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
