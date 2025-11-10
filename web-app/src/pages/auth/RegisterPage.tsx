import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  establishment: {
    name: string;
    cnpj: string;
    address: {
      street: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    email: string;
    taxSettings: {
      taxRegime: 'simples' | 'presumido' | 'real';
      icmsRate: number;
      issRate: number;
      pisRate: number;
      cofinsRate: number;
    };
  };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [step, setStep] = useState(1); // 1: Dados pessoais, 2: Dados do estabelecimento

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    establishment: {
      name: '',
      cnpj: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      },
      phone: '',
      email: '',
      taxSettings: {
        taxRegime: 'simples',
        icmsRate: 7,
        issRate: 5,
        pisRate: 0.65,
        cofinsRate: 3,
      },
    },
  });

  const handleChange = (field: string, value: any) => {
    const keys = field.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string[]> = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = ['Nome deve ter no mínimo 3 caracteres'];
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Email inválido'];
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = ['Senha deve ter no mínimo 8 caracteres'];
    } else {
      if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = [...(newErrors.password || []), 'Senha deve conter pelo menos uma letra maiúscula'];
      }
      if (!/[a-z]/.test(formData.password)) {
        newErrors.password = [...(newErrors.password || []), 'Senha deve conter pelo menos uma letra minúscula'];
      }
      if (!/[0-9]/.test(formData.password)) {
        newErrors.password = [...(newErrors.password || []), 'Senha deve conter pelo menos um número'];
      }
      if (!/[^A-Za-z0-9]/.test(formData.password)) {
        newErrors.password = [...(newErrors.password || []), 'Senha deve conter pelo menos um caractere especial'];
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = ['As senhas não coincidem'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const formatPhone = (phone: string): string => {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    
    // Formata para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    
    return phone; // Retorna original se não tiver 10 ou 11 dígitos
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    try {
      setIsLoading(true);

      const { confirmPassword, ...registerData } = formData;

      // Formatar telefones
      if (registerData.phone) {
        const original = registerData.phone;
        registerData.phone = formatPhone(registerData.phone);
        console.log('📞 Telefone pessoal:', original, '→', registerData.phone);
      }
      if (registerData.establishment.phone) {
        const original = registerData.establishment.phone;
        registerData.establishment.phone = formatPhone(registerData.establishment.phone);
        console.log('📞 Telefone estabelecimento:', original, '→', registerData.establishment.phone);
      }

      // Remover campos vazios opcionais
      if (!registerData.phone) {
        delete registerData.phone;
      }
      if (!registerData.establishment.phone) {
        delete registerData.establishment.phone;
      }
      if (!registerData.establishment.address.complement) {
        delete registerData.establishment.address.complement;
      }

      console.log('📤 Enviando dados:', JSON.stringify(registerData, null, 2));

      const response = await api.post('/auth/register', registerData);

      console.log('✅ Resposta recebida:', response.data);

      if (response.data.success) {
        console.log('🎉 Registro bem-sucedido!');
        console.log('🔑 Token:', response.data.data.token);
        
        // Salvar token e usuário
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('💾 Token e usuário salvos no localStorage');
        
        // Limpar histórico e redirecionar para dashboard
        console.log('🚀 Redirecionando para dashboard...');
        window.location.href = '/dashboard';
      } else {
        console.warn('⚠️ Resposta não indica sucesso:', response.data);
      }
    } catch (err: any) {
      console.error('❌ Erro no registro:', err);
      console.log('📥 Resposta do servidor (RAW):', err.response?.data);
      console.log('📥 Resposta do servidor (JSON):', JSON.stringify(err.response?.data, null, 2));
      console.log('📥 Status:', err.response?.status);
      console.log('📥 Headers:', err.response?.headers);
      
      if (err.response?.data?.errors) {
        console.error('🔍 Erros de validação:', JSON.stringify(err.response.data.errors, null, 2));
        setErrors(err.response.data.errors);
        setError('Por favor, corrija os erros abaixo');
      } else {
        const errorMessage = err.response?.data?.message || 'Erro ao fazer registro';
        console.error('💬 Mensagem de erro:', errorMessage);
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Criar Conta</h2>
        <p className="text-gray-600 mt-1">
          {step === 1 ? 'Preencha seus dados pessoais' : 'Dados do seu estabelecimento'}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          {Object.keys(errors).length > 0 && (
            <ul className="mt-2 space-y-1">
              {Object.entries(errors).map(([field, messages]) => (
                <li key={field} className="text-xs text-red-600">
                  <strong>{field}:</strong> {messages.join(', ')}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="João Silva"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="joao@exemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="(11) 98765-4321"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
              />
              {errors.password && (
                <div className="mt-1 space-y-1">
                  {errors.password.map((err, i) => (
                    <p key={i} className="text-sm text-red-600">{err}</p>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword[0]}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Próximo
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Estabelecimento *</label>
              <input
                type="text"
                value={formData.establishment.name}
                onChange={(e) => handleChange('establishment.name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Restaurante do João"
              />
              {errors['establishment.name'] && (
                <p className="mt-1 text-sm text-red-600">{errors['establishment.name'][0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
              <input
                type="text"
                value={formData.establishment.cnpj}
                onChange={(e) => handleChange('establishment.cnpj', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="12.345.678/0001-90"
              />
              {errors['establishment.cnpj'] && (
                <p className="mt-1 text-sm text-red-600">{errors['establishment.cnpj'][0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                <input
                  type="text"
                  value={formData.establishment.address.street}
                  onChange={(e) => handleChange('establishment.address.street', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Rua Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                <input
                  type="text"
                  value={formData.establishment.address.number}
                  onChange={(e) => handleChange('establishment.address.number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                <input
                  type="text"
                  value={formData.establishment.address.complement}
                  onChange={(e) => handleChange('establishment.address.complement', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Loja 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  value={formData.establishment.address.neighborhood}
                  onChange={(e) => handleChange('establishment.address.neighborhood', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Centro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                <input
                  type="text"
                  value={formData.establishment.address.city}
                  onChange={(e) => handleChange('establishment.address.city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="São Paulo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <input
                  type="text"
                  value={formData.establishment.address.state}
                  onChange={(e) => handleChange('establishment.address.state', e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                <input
                  type="text"
                  value={formData.establishment.address.zipCode}
                  onChange={(e) => handleChange('establishment.address.zipCode', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="01234-567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do Estabelecimento *</label>
              <input
                type="tel"
                value={formData.establishment.phone}
                onChange={(e) => handleChange('establishment.phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="(11) 3456-7890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email do Estabelecimento *</label>
              <input
                type="email"
                value={formData.establishment.email}
                onChange={(e) => handleChange('establishment.email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="contato@restaurante.com"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Voltar
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Criando...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </div>
          </>
        )}
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </>
  );
}
