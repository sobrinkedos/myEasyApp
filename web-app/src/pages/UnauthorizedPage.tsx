import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        {/* Ícone */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-32 h-32 bg-error-light dark:bg-error-dark/20 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-16 h-16 text-error-DEFAULT" />
          </div>
        </motion.div>

        {/* Código */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-6xl font-bold text-error-DEFAULT mb-4">403</h1>
        </motion.div>

        {/* Mensagem */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Acesso Negado
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
            Você não tem permissão para acessar esta página. Entre em contato com o administrador
            se você acredita que isso é um erro.
          </p>
        </motion.div>

        {/* Ações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="outline"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
          <Button
            variant="primary"
            icon={<Home className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Ir para Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
