import React, { ReactNode, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';

export type TableDensity = 'compact' | 'default' | 'comfortable';
export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  density?: TableDensity;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectRow?: (rowId: string) => void;
  onSelectAll?: (selected: boolean) => void;
  onSort?: (key: string, direction: SortDirection) => void;
  rowKey?: keyof T | ((row: T) => string);
  actions?: (row: T) => ReactNode;
  emptyMessage?: string;
  className?: string;
}

function Table<T = any>({
  columns,
  data,
  density = 'default',
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  onSort,
  rowKey = 'id' as keyof T,
  actions,
  emptyMessage = 'Nenhum dado disponível',
  className,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Obter ID da linha
  const getRowId = (row: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return String(row[rowKey]);
  };

  // Verificar se linha está selecionada
  const isRowSelected = (row: T): boolean => {
    return selectedRows.includes(getRowId(row));
  };

  // Verificar se todas as linhas estão selecionadas
  const allSelected = data.length > 0 && data.every((row) => isRowSelected(row));
  const someSelected = data.some((row) => isRowSelected(row)) && !allSelected;

  // Handler de ordenação
  const handleSort = (key: string) => {
    let newDirection: SortDirection = 'asc';

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
        setSortKey(null);
      }
    }

    setSortKey(key);
    setSortDirection(newDirection);

    if (onSort) {
      onSort(key, newDirection);
    }
  };

  // Handler de seleção de todas as linhas
  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(!allSelected);
    }
  };

  // Classes de densidade
  const densityClasses = {
    compact: 'py-2 px-3 text-sm',
    default: 'py-3 px-4 text-base',
    comfortable: 'py-4 px-6 text-base',
  };

  return (
    <div className={clsx('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        {/* Header */}
        <thead className="bg-neutral-50 dark:bg-neutral-800 sticky top-0 z-10">
          <tr className="border-b-2 border-neutral-200 dark:border-neutral-700">
            {/* Checkbox de seleção */}
            {selectable && (
              <th className={clsx('w-12', densityClasses[density])}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
              </th>
            )}

            {/* Colunas */}
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx(
                  densityClasses[density],
                  'font-semibold text-neutral-700 dark:text-neutral-300',
                  'whitespace-nowrap',
                  {
                    'text-left': column.align === 'left' || !column.align,
                    'text-center': column.align === 'center',
                    'text-right': column.align === 'right',
                    'cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-700':
                      column.sortable,
                  }
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="text-neutral-400">
                      {sortKey === column.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}

            {/* Coluna de ações */}
            {actions && (
              <th className={clsx(densityClasses[density], 'text-right')}>Ações</th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                className="py-12 text-center text-neutral-500 dark:text-neutral-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const rowId = getRowId(row);
              const selected = isRowSelected(row);

              return (
                <tr
                  key={rowId}
                  className={clsx(
                    'border-b border-neutral-200 dark:border-neutral-700',
                    'transition-colors duration-150',
                    {
                      'hover:bg-neutral-50 dark:hover:bg-neutral-800': !selected,
                      'bg-primary-50 dark:bg-primary-900/20': selected,
                    }
                  )}
                >
                  {/* Checkbox */}
                  {selectable && (
                    <td className={densityClasses[density]}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onSelectRow && onSelectRow(rowId)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                  )}

                  {/* Células */}
                  {columns.map((column) => {
                    const value = (row as any)[column.key];
                    const content = column.render ? column.render(value, row) : value;

                    return (
                      <td
                        key={column.key}
                        className={clsx(
                          densityClasses[density],
                          'text-neutral-900 dark:text-neutral-100',
                          {
                            'text-left': column.align === 'left' || !column.align,
                            'text-center': column.align === 'center',
                            'text-right': column.align === 'right',
                          }
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}

                  {/* Ações */}
                  {actions && (
                    <td className={clsx(densityClasses[density], 'text-right')}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

Table.displayName = 'Table';

export default Table;
