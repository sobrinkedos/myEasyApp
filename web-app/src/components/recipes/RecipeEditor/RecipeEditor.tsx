import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableIngredientItem } from './SortableIngredientItem';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Plus, Calculator } from 'lucide-react';

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
  notes?: string;
}

interface RecipeEditorProps {
  ingredients: RecipeIngredient[];
  onChange: (ingredients: RecipeIngredient[]) => void;
  onAddIngredient: () => void;
  yieldValue: number;
  readonly?: boolean;
}

export const RecipeEditor = ({
  ingredients,
  onChange,
  onAddIngredient,
  yieldValue = 1,
  readonly = false,
}: RecipeEditorProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = ingredients.findIndex((item) => item.id === active.id);
      const newIndex = ingredients.findIndex((item) => item.id === over.id);

      onChange(arrayMove(ingredients, oldIndex, newIndex));
    }
  };

  const handleUpdateIngredient = (id: string, updates: Partial<RecipeIngredient>) => {
    onChange(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, ...updates } : ing
      )
    );
  };

  const handleRemoveIngredient = (id: string) => {
    onChange(ingredients.filter((ing) => ing.id !== id));
  };

  // Calcular custos
  const totalCost = ingredients.reduce((sum, ing) => sum + ing.cost, 0);
  const costPerPortion = yieldValue > 0 ? totalCost / yieldValue : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ingredientes</h3>
        {!readonly && (
          <Button
            variant="outline"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onAddIngredient}
          >
            Adicionar Ingrediente
          </Button>
        )}
      </div>

      {ingredients.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <p>Nenhum ingrediente adicionado</p>
          {!readonly && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onAddIngredient}
              className="mt-4"
            >
              Adicionar Primeiro Ingrediente
            </Button>
          )}
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={ingredients.map((ing) => ing.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {ingredients.map((ingredient) => (
                  <SortableIngredientItem
                    key={ingredient.id}
                    ingredient={ingredient}
                    onUpdate={handleUpdateIngredient}
                    onRemove={handleRemoveIngredient}
                    readonly={readonly}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Resumo de Custos */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-primary-500" />
              <h4 className="font-semibold">Resumo de Custos</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Custo Total
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  R$ {totalCost.toFixed(2)}
                </p>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                  Custo por Porção
                </p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  R$ {costPerPortion.toFixed(2)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Baseado em {yieldValue} {yieldValue === 1 ? 'porção' : 'porções'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
