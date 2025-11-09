import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, DollarSign } from 'lucide-react';
import { RecipeIngredient } from './RecipeEditor';
import { Button } from '../../ui/Button';

interface SortableIngredientItemProps {
  ingredient: RecipeIngredient;
  onUpdate: (id: string, updates: Partial<RecipeIngredient>) => void;
  onRemove: (id: string) => void;
  readonly?: boolean;
}

export const SortableIngredientItem = ({
  ingredient,
  onUpdate,
  onRemove,
  readonly = false,
}: SortableIngredientItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ingredient.id, disabled: readonly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 ${
        !readonly ? 'hover:border-primary-500 dark:hover:border-primary-500' : ''
      } transition-colors`}
    >
      {/* Drag Handle */}
      {!readonly && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      {/* Ingredient Info */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        {/* Nome */}
        <div className="md:col-span-2">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {ingredient.ingredientName}
          </p>
          {ingredient.notes && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {ingredient.notes}
            </p>
          )}
        </div>

        {/* Quantidade */}
        <div className="flex items-center gap-2">
          {readonly ? (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {ingredient.quantity} {ingredient.unit}
            </p>
          ) : (
            <>
              <input
                type="number"
                value={ingredient.quantity}
                onChange={(e) =>
                  onUpdate(ingredient.id, {
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-20 px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                step="0.01"
                min="0"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {ingredient.unit}
              </span>
            </>
          )}
        </div>

        {/* Custo */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-success" />
          <span className="font-semibold text-success">
            R$ {ingredient.cost.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      {!readonly && (
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 className="w-4 h-4" />}
          onClick={() => onRemove(ingredient.id)}
          className="text-error hover:bg-error/10"
        />
      )}
    </div>
  );
};
