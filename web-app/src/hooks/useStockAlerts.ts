import { useState, useEffect } from 'react';
import api from '@/services/api';

interface Alert {
  id: string;
  type: 'divergence' | 'accuracy' | 'cmv' | 'period';
  severity: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    path: string;
  };
}

export function useStockAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const alertsList: Alert[] = [];

      // Check for high divergence appraisals
      const appraisalsRes = await api.get('/appraisals?status=completed');
      const appraisals = appraisalsRes.data.data || appraisalsRes.data || [];
      
      appraisals.forEach((appraisal: any) => {
        if (appraisal.accuracy < 90) {
          alertsList.push({
            id: `appraisal-${appraisal.id}`,
            type: 'accuracy',
            severity: appraisal.accuracy < 85 ? 'error' : 'warning',
            title: 'Acurácia Baixa',
            message: `Conferência com acurácia de ${appraisal.accuracy.toFixed(1)}% aguardando aprovação`,
            action: {
              label: 'Revisar',
              path: `/appraisals/${appraisal.id}/review`,
            },
          });
        }
      });

      // Check for high CMV periods
      const periodsRes = await api.get('/cmv/periods?status=closed&limit=5');
      const periods = periodsRes.data.data || periodsRes.data || [];
      
      periods.forEach((period: any) => {
        if (period.cmvPercentage > 40) {
          alertsList.push({
            id: `cmv-${period.id}`,
            type: 'cmv',
            severity: period.cmvPercentage > 45 ? 'error' : 'warning',
            title: 'CMV Alto',
            message: `Período com CMV de ${period.cmvPercentage.toFixed(1)}% (acima de 40%)`,
            action: {
              label: 'Analisar',
              path: `/cmv/periods/${period.id}`,
            },
          });
        }
      });

      // Check for open periods
      const openPeriods = periods.filter((p: any) => p.status === 'open');
      openPeriods.forEach((period: any) => {
        const daysSinceStart = Math.floor(
          (new Date().getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceStart > 30) {
          alertsList.push({
            id: `period-open-${period.id}`,
            type: 'period',
            severity: 'warning',
            title: 'Período Aberto Há Muito Tempo',
            message: `Período aberto há ${daysSinceStart} dias. Considere fechá-lo.`,
            action: {
              label: 'Fechar',
              path: `/cmv/periods/${period.id}/close`,
            },
          });
        }
      });

      setAlerts(alertsList);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return { alerts, loading, dismissAlert, refresh: loadAlerts };
}
