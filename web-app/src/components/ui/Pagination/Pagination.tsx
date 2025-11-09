import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showFirstLast = true,
  maxVisiblePages = 7,
  className,
}) => {
  // Calcular range de itens exibidos
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Gerar array de páginas visíveis
  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Ajustar se estiver no início
    if (currentPage <= halfVisible) {
      endPage = maxVisiblePages;
    }

    // Ajustar se estiver no final
    if (currentPage >= totalPages - halfVisible) {
      startPage = totalPages - maxVisiblePages + 1;
    }

    // Adicionar primeira página e ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Adicionar páginas visíveis
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Adicionar ellipsis e última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Classes do botão
  const buttonClasses = clsx(
    'inline-flex items-center justify-center',
    'min-w-[36px] h-9 px-3',
    'text-sm font-medium',
    'rounded-lg',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
  );

  const pageButtonClasses = (isActive: boolean, isDisabled: boolean = false) =>
    clsx(buttonClasses, {
      'bg-primary-500 text-white': isActive,
      'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800':
        !isActive && !isDisabled,
      'text-neutral-400 dark:text-neutral-600 cursor-not-allowed': isDisabled,
    });

  return (
    <div className={clsx('flex items-center justify-between gap-4 flex-wrap', className)}>
      {/* Informação de itens */}
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        Mostrando <span className="font-medium">{startItem}</span> a{' '}
        <span className="font-medium">{endItem}</span> de{' '}
        <span className="font-medium">{totalItems}</span> resultados
      </div>

      <div className="flex items-center gap-4">
        {/* Seletor de tamanho de página */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="page-size"
              className="text-sm text-neutral-600 dark:text-neutral-400"
            >
              Itens por página:
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={clsx(
                'px-3 py-1.5 rounded-lg',
                'bg-white dark:bg-neutral-900',
                'border-2 border-neutral-300 dark:border-neutral-600',
                'text-sm text-neutral-900 dark:text-neutral-100',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                'transition-colors duration-200'
              )}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controles de navegação */}
        <div className="flex items-center gap-1">
          {/* Primeira página */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={pageButtonClasses(false, currentPage === 1)}
              aria-label="Primeira página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}

          {/* Página anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={pageButtonClasses(false, currentPage === 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Números de página */}
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex items-center justify-center min-w-[36px] h-9 text-neutral-400"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={pageButtonClasses(currentPage === page)}
                aria-label={`Página ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}

          {/* Próxima página */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={pageButtonClasses(false, currentPage === totalPages)}
            aria-label="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Última página */}
          {showFirstLast && (
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={pageButtonClasses(false, currentPage === totalPages)}
              aria-label="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Pagination.displayName = 'Pagination';

export default Pagination;
