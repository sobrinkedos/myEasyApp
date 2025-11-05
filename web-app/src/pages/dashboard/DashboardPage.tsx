export function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Metric Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Vendas Hoje</p>
          <p className="text-2xl font-bold text-gray-900">R$ 0,00</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Comandas Abertas</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Produtos</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-1">Estoque Baixo</p>
          <p className="text-2xl font-bold text-orange-600">0</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
        <p className="text-gray-600">Nenhuma atividade recente</p>
      </div>
    </div>
  );
}
