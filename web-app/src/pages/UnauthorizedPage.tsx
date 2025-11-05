import { useNavigate } from 'react-router-dom';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        <p className="text-xl text-gray-600 mb-2">Acesso Negado</p>
        <p className="text-gray-500 mb-8">Você não tem permissão para acessar esta página</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
}
