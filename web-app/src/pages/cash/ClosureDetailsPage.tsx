import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import {
  ArrowLeft,
  Download,
  FileText,
  Clock,
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface SessionInfo {
  id: string;
  cashRegister: string;
  operator: string;
  openedAt: string;
  closedAt: string;
  duration: string;
}

interface FinancialSummary {
  openingAmount: number;
  salesTotal: number;
  cashSales: number;
  cardSales: number;
  pixSales: number;
  withdrawals: number;
  supplies: number;
  expectedCash: number;
  countedAmount: number;
  difference: number;
  differencePercent: number;
}

interface CashCount {
  denomination: number;
  quantity: number;
  total: number;
}

interface Transaction {
  id: string;
  type: string;
  paymentMethod?: string;
  amount: number;
  description?: string;
  timestamp: string;
}

interface DocumentInfo {
  id: string;
  documentNumber: string;
  generatedAt: string;
  pdfUrl: string;
  downloadCount: number;
}

interface ClosureDetails {
  session: SessionInfo;
  financial: FinancialSummary;
  transactions: Transaction[];
  counts: CashCount[];
  document: DocumentInfo | null;
}

export function ClosureDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<ClosureDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (id) {
      loadDetails();
    }
  }, [id]);

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get(`/cash/closures/${id}`);

      if (response.data.success) {
        setDetails(response.data.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar detalhes:', error);
      setError('Erro ao carregar detalhes do fechamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocument = async () => {
    if (!details) return;

    try {
      const response = await api.get(`/cash/documents/${id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fechamento-${details.document?.documentNumber || details.session.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      alert('Erro ao baixar documento');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      SALE: 'Venda',
      WITHDRAWAL: 'Sangria',
      SUPPLY: 'Suprimento',
      OPENING: 'Abertura',
      CLOSING: 'Fechamento',
      ADJUSTMENT: 'Ajuste',
    };
    return types[type] || type;
  };

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return '-';
    const methods: Record<string, string> = {
      CASH: 'Dinheiro',
      DEBIT: 'Débito',
      CREDIT: 'Crédito',
      PIX: 'PIX',
      VOUCHER: 'Voucher',
      OTHER: 'Outro',
    };
    return methods[method] || method;
  };

  const getStatusInfo = (differencePercent: number) => {
    const absDiff = Math.abs(differencePercent);
    if (absDiff > 1) {
      return {
        label: 'Alerta',
        color: 'red',
        icon: AlertCircle,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      };
    } else if (absDiff > 0.5) {
      return {
        label: 'Atenção',
        color: 'yellow',
        icon: AlertTriangle,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      };
    } else {
      return {
        label: 'Normal',
        color: 'green',
        icon: CheckCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      };
    }
  };

  const filteredTransactions = details?.transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">{error || 'Fechamento não encontrado'}</p>
        <button
          onClick={() => navigate('/cash/closures')}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(details.financial.differencePercent);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cash/closures')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fechamento {details.document?.documentNumber || `#${details.session.id.substring(0, 8)}`}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {format(new Date(details.session.closedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {details.document && (
            <button
              onClick={handleDownloadDocument}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Documento
            </button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className={`${statusInfo.bgColor} rounded-lg p-4`}>
        <div className="flex items-center">
          <StatusIcon className={`w-6 h-6 ${statusInfo.textColor} mr-3`} />
          <div>
            <h3 className={`text-lg font-semibold ${statusInfo.textColor}`}>
              Status: {statusInfo.label}
            </h3>
            <p className={`text-sm ${statusInfo.textColor}`}>
              Diferença de {formatCurrency(details.financial.difference)} (
              {details.financial.differencePercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Sessão</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <User className="w-4 h-4 mr-1" />
              Operador
            </div>
            <div className="text-base font-medium text-gray-900">{details.session.operator}</div>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <DollarSign className="w-4 h-4 mr-1" />
              Caixa
            </div>
            <div className="text-base font-medium text-gray-900">{details.session.cashRegister}</div>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Clock className="w-4 h-4 mr-1" />
              Duração
            </div>
            <div className="text-base font-medium text-gray-900">{details.session.duration}</div>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FileText className="w-4 h-4 mr-1" />
              Downloads
            </div>
            <div className="text-base font-medium text-gray-900">{details.document?.downloadCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Valor de Abertura</span>
            <span className="font-medium">{formatCurrency(details.financial.openingAmount)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Vendas em Dinheiro</span>
            <span className="font-medium text-green-600">{formatCurrency(details.financial.cashSales)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Vendas em Cartão</span>
            <span className="font-medium text-green-600">{formatCurrency(details.financial.cardSales)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Vendas PIX</span>
            <span className="font-medium text-green-600">{formatCurrency(details.financial.pixSales)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600 flex items-center">
              <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
              Sangrias
            </span>
            <span className="font-medium text-red-600">{formatCurrency(details.financial.withdrawals)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              Suprimentos
            </span>
            <span className="font-medium text-green-600">{formatCurrency(details.financial.supplies)}</span>
          </div>
          <div className="flex justify-between py-2 border-b bg-gray-50 px-2 -mx-2">
            <span className="font-semibold text-gray-900">Total de Vendas</span>
            <span className="font-semibold text-gray-900">{formatCurrency(details.financial.salesTotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Valor Esperado em Caixa</span>
            <span className="font-medium">{formatCurrency(details.financial.expectedCash)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Valor Contado</span>
            <span className="font-medium">{formatCurrency(details.financial.countedAmount)}</span>
          </div>
          <div className="flex justify-between py-3 bg-gray-50 px-2 -mx-2">
            <span className="font-semibold text-gray-900">Diferença (Quebra)</span>
            <span className={`font-semibold ${details.financial.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(details.financial.difference)} ({details.financial.differencePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Cash Counts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contagem de Dinheiro</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Denominação
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {details.counts.map((count, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(count.denomination)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {count.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(count.total)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                  Total Contado
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(details.financial.countedAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Transações do Turno</h2>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="all">Todas</option>
            <option value="SALE">Vendas</option>
            <option value="WITHDRAWAL">Sangrias</option>
            <option value="SUPPLY">Suprimentos</option>
          </select>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {getTransactionTypeLabel(transaction.type)}
                  </span>
                  {transaction.paymentMethod && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {getPaymentMethodLabel(transaction.paymentMethod)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {format(new Date(transaction.timestamp), 'HH:mm:ss', { locale: ptBR })}
                  {transaction.description && ` • ${transaction.description}`}
                </div>
              </div>
              <div
                className={`text-lg font-semibold ${
                  transaction.type === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {transaction.type === 'WITHDRAWAL' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação encontrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
