# RecipeEditor

Componente de editor de receitas com drag-and-drop para reordenar ingredientes, cálculo automático de custos e visualização de árvore de ingredientes.

## Características

- **Drag-and-Drop**: Reordene ingredientes arrastando e soltando usando @dnd-kit
- **Cálculo Automático**: Custo total e custo por porção calculados automaticamente
- **Edição Inline**: Edite quantidades diretamente na lista
- **Indicadores Visuais**: Ícones e cores para identificar custos
- **Modo Readonly**: Visualização sem edição para páginas de detalhes
- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Tema**: Suporte completo a tema claro/escuro

## Props

### RecipeEditor

```typescript
interface RecipeEditorProps {
  ingredients: RecipeIngredient[];
  onChange: (ingredients: RecipeIngredient[]) => void;
  onAddIngredient: () => void;
  yieldValue: number;
  readonly?: boolean;
}
```

- `ingredients` (array, obrigatório): Lista de ingredientes da receita
- `onChange` (function, obrigatório): Callback chamado quando a lista de ingredientes muda
- `onAddIngredient` (function, obrigatório): Callback para adicionar novo ingrediente
- `yieldValue` (number, obrigatório): Rendimento da receita (número de porções)
- `readonly` (boolean, opcional): Modo somente leitura (padrão: false)

### RecipeIngredient

```typescript
interface RecipeIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
  notes?: string;
}
```

## Uso

### Modo de Edição

```tsx
import { RecipeEditor, RecipeIngredient } from '@/components/recipes';

function RecipeForm() {
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [yieldValue, setYieldValue] = useState(4);

  const handleAddIngredient = () => {
    // Abrir modal ou drawer para selecionar ingrediente
    // Adicionar à lista após seleção
  };

  return (
    <RecipeEditor
      ingredients={ingredients}
      onChange={setIngredients}
      onAddIngredient={handleAddIngredient}
      yieldValue={yieldValue}
    />
  );
}
```

### Modo Readonly

```tsx
import { RecipeEditor } from '@/components/recipes';

function RecipeDetail({ recipe }) {
  return (
    <RecipeEditor
      ingredients={recipe.ingredients}
      onChange={() => {}}
      onAddIngredient={() => {}}
      yieldValue={recipe.yield}
      readonly
    />
  );
}
```

## Funcionalidades

### Drag-and-Drop

- Clique e arraste o ícone de grip (⋮⋮) para reordenar ingredientes
- A ordem é salva automaticamente através do callback `onChange`
- Feedback visual durante o arrasto (opacidade reduzida)

### Edição de Quantidade

- Clique no campo de quantidade para editar
- Aceita valores decimais (ex: 0.5, 1.25)
- Atualiza automaticamente o custo quando a quantidade muda

### Cálculo de Custos

O componente calcula automaticamente:
- **Custo Total**: Soma de todos os custos dos ingredientes
- **Custo por Porção**: Custo total dividido pelo rendimento

```
Custo por Porção = Custo Total / Rendimento
```

### Remoção de Ingredientes

- Clique no ícone de lixeira para remover um ingrediente
- A remoção é imediata e atualiza os custos automaticamente

## Estrutura Visual

```
┌─────────────────────────────────────────────────────┐
│ Ingredientes                    [+ Adicionar]       │
├─────────────────────────────────────────────────────┤
│ ⋮⋮ Farinha de Trigo    500 g    💵 R$ 3.50    🗑   │
│ ⋮⋮ Açúcar              200 g    💵 R$ 1.80    🗑   │
│ ⋮⋮ Ovos                3 un     💵 R$ 2.40    🗑   │
├─────────────────────────────────────────────────────┤
│ 🧮 Resumo de Custos                                 │
│ ┌──────────────────┐  ┌──────────────────┐        │
│ │ Custo Total      │  │ Custo por Porção │        │
│ │ R$ 7.70          │  │ R$ 1.93          │        │
│ └──────────────────┘  └──────────────────┘        │
└─────────────────────────────────────────────────────┘
```

## Acessibilidade

- Navegação por teclado completa
- Suporte a leitores de tela
- Indicadores visuais de foco
- Labels descritivos em todos os campos

## Dependências

- `@dnd-kit/core`: Funcionalidade de drag-and-drop
- `@dnd-kit/sortable`: Ordenação de listas
- `@dnd-kit/utilities`: Utilitários para transformações CSS

## Exemplo Completo

Veja o arquivo `RecipeFormPage.tsx` para um exemplo completo de integração com formulário e API.
