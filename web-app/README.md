# Restaurant Management - Web App

Frontend web application for the Restaurant Management System.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Routing
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Project Structure

```
src/
├── app/                    # App configuration
│   ├── App.tsx            # Main app component
│   └── router.tsx         # Router configuration
├── pages/                  # Page components
├── layouts/                # Layout components
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   ├── common/            # Common composed components
│   └── domain/            # Domain-specific components
├── features/              # Feature modules
├── hooks/                 # Custom hooks
├── services/              # API services
├── contexts/              # React contexts
├── utils/                 # Utility functions
├── types/                 # TypeScript types
├── constants/             # Constants
└── assets/               # Static assets
```

## Environment Variables

Create a `.env` file based on `.env.development`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Backend Integration

The frontend connects to the backend API running on `http://localhost:3000`.

Make sure the backend is running before starting the frontend:

```bash
# In the root directory
npm run dev
```

## License

MIT
