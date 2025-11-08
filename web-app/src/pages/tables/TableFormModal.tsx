import { useState, useEffect } from 'react';
import { tableService, Table } from '../../services/table.service';

interface TableFormModalProps {
  table?: Table | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TableFormModal({ table, onClose, onSuccess }: TableFormModalProps) {
  const [formData, setFormData] = useState({
    number: table?.number || 0,
    capacity: table?.capacity || 2,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (table) {
        await tableService.update(table.id, formData);
      } else {
        await tableService.create(formData);
      }
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar mesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {table ? 'Editar Mesa' : 'Nova Mesa'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número da Mesa *
            </label>
            <input
              type="number"
              min="1"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidade *
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
