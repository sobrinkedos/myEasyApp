import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { commandService, Command } from '../../services/command.service';

export default function PendingCommandsPage() {
  const navigate = useNavigate();
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingCommands();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadPendingCommands, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingCommands = async () => {
    try {
      setLoading(true);
      const response = await commandService.getAll({ status: 'pending_payment' });
      setCommands(response.data);
    } catch (error) {
      console.error('Erro ao carregar comandas:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Comandas Pendentes de Pagamento</h1>
        <button
          onClick={loadPendingCommands}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          🔄 Atualizar
        </button>
      </div>

      {commands.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhuma comanda pendente de pagamento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commands.map((command) => (
            <div key={command.id} className="bg-white rounded-lg shadow-lg border-2 border-yellow-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{command.code}</h2>
                  <p className="text-sm text-gray-600">
                    {command.table ? `Mesa ${command.table.number}` : 'Balcão'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Garçom: {command.waiter?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Pessoas: {command.numberOfPeople}
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                  Pendente
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">R$ {Number(command.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxa de Serviço:</span>
                    <span className="font-medium">R$ {Number(command.serviceCharge).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">R$ {Number(command.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/cash/commands/${command.id}/payment`)}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Ver Comanda
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                Aberta em: {new Date(command.openedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
