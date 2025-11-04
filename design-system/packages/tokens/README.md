# @restaurant-system/tokens

Design tokens para o Restaurant Design System. Este pacote contém todos os valores fundamentais de design (cores, tipografia, espaçamentos, etc.) que são usados em todos os componentes.

## Instalação

```bash
npm install @restaurant-system/tokens
```

## Uso

```typescript
import { colors, typography, spacing } from '@restaurant-system/tokens';

// Usar cores
const primaryColor = colors.primary[500]; // #FF7A4D

// Usar tipografia
const headingStyle = typography.h1;

// Usar espaçamentos
const padding = spacing[4]; // 16px
```

## Tokens Disponíveis

### Cores

- **primary**: Paleta laranja/vermelho (50-900)
- **secondary**: Paleta verde (50-900)
- **neutral**: Escala de cinzas (0-950)
- **feedback**: success, error, warning, info
- **orderStatus**: pending, preparing, ready, delivered, cancelled
- **tableStatus**: available, occupied, reserved

### Tipografia

- **fontFamily**: display, body, mono
- **fontSize**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
- **fontWeight**: regular, medium, semibold, bold
- **lineHeight**: tight, snug, normal, relaxed, loose
- **typography**: h1, h2, h3, h4, body, bodySmall, caption, button

### Espaçamento

Escala baseada em múltiplos de 4px: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16

### Border Radius

none, xs, sm, md, lg, xl, full

### Sombras

level1, level2, level3, level4

### Transições

- **duration**: fast, normal, slow
- **easing**: easeIn, easeOut, easeInOut
