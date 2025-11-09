import React, { ReactNode } from 'react';
import { Grid, List } from 'lucide-react';
import clsx from 'clsx';
import { Card } from '../Card';

export type ViewMode = 'grid' | 'list';
export type GridColumns = 1 | 2 | 3 | 4;

export interface GridViewProps<T = any> {
  data: T[];
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  columns?: GridColumns;
  renderCard: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  className?: string;
  showToggle?: boolean;
}

function GridView<T = any>({
  data,
  viewMode = 'grid',
  onViewModeChange,
  columns = 3,
  renderCard,
  emptyMessage = 'Nenhum item encontrado',
  className,
  showToggle = true,
}: GridViewProps<T>) {
  // Classes de colunas do grid
  const gridColumnsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={className}>
      {/* Toggle de visualização */}
      {showToggle && onViewModeChange && (
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-lg border-2 border-neutral-200 dark:border-neutral-700 p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={clsx(
                'p-2 rounded transition-colors duration-200',
                {
                  'bg-primary-500 text-white': viewMode === 'grid',
                  'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800':
                    viewMode !== 'grid',
                }
              )}
              aria-label="Visualização em grid"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={clsx(
                'p-2 rounded transition-colors duration-200',
                {
                  'bg-primary-500 text-white': viewMode === 'list',
                  'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800':
                    viewMode !== 'list',
                }
              )}
              aria-label="Visualização em lista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      {data.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
        </div>
      ) : (
        <div
          className={clsx({
            // Grid view
            [`grid gap-4 ${gridColumnsClasses[columns]}`]: viewMode === 'grid',
            // List view
            'flex flex-col gap-3': viewMode === 'list',
          })}
        >
          {data.map((item, index) => (
            <div key={index}>{renderCard(item, index)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

GridView.displayName = 'GridView';

// Componente auxiliar para cards informativos
export interface GridCardProps {
  title: string;
  description?: string;
  image?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export const GridCard: React.FC<GridCardProps> = ({
  title,
  description,
  image,
  badge,
  footer,
  onClick,
  className,
  children,
}) => {
  return (
    <Card
      variant="elevated"
      hoverable={!!onClick}
      onClick={onClick}
      className={clsx('overflow-hidden', className)}
    >
      {/* Imagem */}
      {image && (
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          {badge && (
            <div className="absolute top-3 right-3">
              {badge}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {description}
          </p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
          {footer}
        </div>
      )}
    </Card>
  );
};

GridCard.displayName = 'GridCard';

export default GridView;
