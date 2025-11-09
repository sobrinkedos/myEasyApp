import React, { useState } from 'react';
import { X, Filter, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Badge } from '../Badge';
import { Button } from '../Button';

export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';

export interface FilterCriterion {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  criteria: FilterCriterion[];
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
}

export interface FilterPanelProps {
  fields: FilterField[];
  activeCriteria: FilterCriterion[];
  savedFilters?: SavedFilter[];
  onApply: (criteria: FilterCriterion[]) => void;
  onSave?: (name: string, criteria: FilterCriterion[]) => void;
  onLoadSaved?: (filter: SavedFilter) => void;
  onDeleteSaved?: (filterId: string) => void;
  className?: string;
}

const operatorLabels: Record<FilterOperator, string> = {
  equals: 'Igual a',
  contains: 'Contém',
  startsWith: 'Começa com',
  endsWith: 'Termina com',
  greaterThan: 'Maior que',
  lessThan: 'Menor que',
  between: 'Entre',
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  activeCriteria,
  savedFilters = [],
  onApply,
  onSave,
  onLoadSaved,
  onDeleteSaved,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState<FilterCriterion[]>(activeCriteria);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Adicionar novo critério
  const addCriterion = () => {
    const newCriterion: FilterCriterion = {
      id: `criterion-${Date.now()}`,
      field: fields[0]?.key || '',
      operator: 'equals',
      value: '',
    };
    setCriteria([...criteria, newCriterion]);
  };

  // Remover critério
  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  // Atualizar critério
  const updateCriterion = (id: string, updates: Partial<FilterCriterion>) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Aplicar filtros
  const handleApply = () => {
    onApply(criteria);
    setIsOpen(false);
  };

  // Limpar filtros
  const handleClear = () => {
    setCriteria([]);
    onApply([]);
  };

  // Salvar filtro
  const handleSave = () => {
    if (onSave && filterName.trim()) {
      onSave(filterName, criteria);
      setFilterName('');
      setSaveDialogOpen(false);
    }
  };

  // Carregar filtro salvo
  const handleLoadSaved = (filter: SavedFilter) => {
    setCriteria(filter.criteria);
    if (onLoadSaved) {
      onLoadSaved(filter);
    }
  };

  const activeCount = activeCriteria.length;

  return (
    <div className={clsx('relative', className)}>
      {/* Botão de filtro */}
      <Button
        variant="outline"
        icon={<Filter className="w-4 h-4" />}
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        Filtros
        {activeCount > 0 && (
          <Badge color="primary" variant="solid" className="ml-2">
            {activeCount}
          </Badge>
        )}
      </Button>

      {/* Badges de filtros ativos */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeCriteria.map((criterion) => {
            const field = fields.find((f) => f.key === criterion.field);
            return (
              <Badge
                key={criterion.id}
                color="primary"
                variant="soft"
                className="flex items-center gap-1"
              >
                <span className="text-xs">
                  {field?.label}: {operatorLabels[criterion.operator]} {criterion.value}
                </span>
                <button
                  onClick={() => {
                    const newCriteria = activeCriteria.filter((c) => c.id !== criterion.id);
                    onApply(newCriteria);
                  }}
                  className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Painel de filtros */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'absolute z-50 mt-2 w-96',
              'bg-white dark:bg-neutral-900',
              'border-2 border-neutral-200 dark:border-neutral-700',
              'rounded-lg shadow-xl',
              'p-4'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Filtros Avançados
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros salvos */}
            {savedFilters.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Filtros Salvos
                </label>
                <div className="space-y-1">
                  {savedFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded"
                    >
                      <button
                        onClick={() => handleLoadSaved(filter)}
                        className="flex-1 text-left text-sm text-neutral-700 dark:text-neutral-300"
                      >
                        {filter.name}
                      </button>
                      {onDeleteSaved && (
                        <button
                          onClick={() => onDeleteSaved(filter.id)}
                          className="p-1 text-error-DEFAULT hover:bg-error-light dark:hover:bg-error-dark/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Critérios */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {criteria.map((criterion) => {
                const field = fields.find((f) => f.key === criterion.field);
                return (
                  <div key={criterion.id} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      {/* Campo */}
                      <select
                        value={criterion.field}
                        onChange={(e) => updateCriterion(criterion.id, { field: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
                      >
                        {fields.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      {/* Operador */}
                      <select
                        value={criterion.operator}
                        onChange={(e) =>
                          updateCriterion(criterion.id, { operator: e.target.value as FilterOperator })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
                      >
                        {Object.entries(operatorLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>

                      {/* Valor */}
                      {field?.type === 'select' && field.options ? (
                        <select
                          value={criterion.value}
                          onChange={(e) => updateCriterion(criterion.id, { value: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
                        >
                          <option value="">Selecione...</option>
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field?.type || 'text'}
                          value={criterion.value}
                          onChange={(e) => updateCriterion(criterion.id, { value: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm"
                          placeholder="Valor..."
                        />
                      )}
                    </div>

                    <button
                      onClick={() => removeCriterion(criterion.id)}
                      className="p-2 text-error-DEFAULT hover:bg-error-light dark:hover:bg-error-dark/20 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Adicionar critério */}
            <button
              onClick={addCriterion}
              className="w-full py-2 text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            >
              + Adicionar Critério
            </button>

            {/* Ações */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Button variant="outline" size="sm" onClick={handleClear} fullWidth>
                Limpar
              </Button>
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Save className="w-4 h-4" />}
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={criteria.length === 0}
                >
                  Salvar
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={handleApply} fullWidth>
                Aplicar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de salvar filtro */}
      <AnimatePresence>
        {saveDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSaveDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Salvar Filtro</h3>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Nome do filtro..."
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)} fullWidth>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} fullWidth disabled={!filterName.trim()}>
                  Salvar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;
