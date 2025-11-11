import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { commandService, Command } from '../../services/command.service';
import { tableService, Table } from '../../services/table.service';

export default function CommandsListPage() {
  const navigate = useNavigate();
  const [commands, setCommands] = useState<Command[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('open');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [commandsData, tablesData] = await Promise.all([
        filter === 'open' 
          ? commandService.getOpen()
          : commandService.getAll({ status: filter === 'all' ? undefined : filter }),
        tableService.getAll(),
      ]);
      setCommands(commandsData.data);
      setTables(tablesData.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      paid: 'bg-blue-100 text-blue-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    return type === 'table' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-orange-100 text-orange-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Comandas</h1>
        <button
          onClick={() => navigate('/commands/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nova Comanda
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por código, mesa, cliente ou garçom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'open'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Abertas
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'closed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Fechadas
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commands
          .filter((command) => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
              command.code.toLowerCase().includes(search) ||
              command.table?.number.toString().includes(search) ||
              command.customerName?.toLowerCase().includes(search) ||
              command.waiter?.name.toLowerCase().includes(search)
            );
          })
          .map((command) => (
          <div
            key={command.id}
            onClick={() => navigate(`/commands/${command.id}`)}
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {command.code}
                </h3>
                <p className="text-sm text-gray-500">
                  {command.table ? `Mesa ${command.table.number}` : 'Balcão'}
                </p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(command.status)}`}>
                  {command.status === 'open' ? 'Aberta' : command.status === 'closed' ? 'Fechada' : 'Paga'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadge(command.type)}`}>
                  {command.type === 'table' ? 'Mesa' : 'Balcão'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pessoas:</span>
                <span className="font-medium">{command.numberOfPeople}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Garçom:</span>
                <span className="font-medium">{command.waiter?.name}</span>
              </div>
              {command.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{command.customerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Aberta:</span>
                <span className="font-medium">
                  {new Date(command.openedAt).toLocaleString('pt-BR')}
                </span>
              </div>
              {command.status !== 'open' && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-900 font-semibold">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {Number(command.total).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {commands.filter((command) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          command.code.toLowerCase().includes(search) ||
          command.table?.number.toString().includes(search) ||
          command.customerName?.toLowerCase().includes(search) ||
          command.waiter?.name.toLowerCase().includes(search)
        );
      }).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? 'Nenhuma comanda encontrada com os critérios de busca' : 'Nenhuma comanda encontrada'}
          </p>
        </div>
      )}
    </div>
  );
}
