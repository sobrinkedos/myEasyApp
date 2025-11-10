import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 Formulário submetido');
    setError('');

    if (!email || !password) {
      console.log('⚠️ Campos vazios');
      setError('Por favor, preencha todos os campos');
      return;
    }

    console.log('📝 Dados do formulário:', { email, password: '***' });

    try {
      setIsLoading(true);
      console.log('⏳ Chamando função login...');
      await login({ email, password });
      console.log('✅ Login retornou com sucesso!');
      console.log('🚀 Redirecionando para:', from);
      
      // Usar window.location para garantir limpeza completa do estado
      window.location.href = from;
    } catch (err: any) {
      console.error('❌ Erro capturado no handleSubmit:', err);
      setError(err.message || 'Erro ao fazer login');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bem-vindo</h2>
        <p className="text-gray-600 mt-1">Faça login para continuar</p>
      </div>

      {(error || authError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error || authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="seu@email.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <div className="mt-4 space-y-2">
        <div className="text-center">
          <Link to="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-700">
            Esqueceu sua senha?
          </Link>
        </div>
        
        <div className="text-center pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/auth/register" className="text-orange-600 hover:text-orange-700 font-medium">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
