import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para gerenciar transições de página
 * Scroll para o topo quando a rota muda
 */
export const usePageTransition = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll suave para o topo quando a rota muda
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);

  return location;
};
