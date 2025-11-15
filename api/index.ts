import 'dotenv/config';

// Importar diretamente o código compilado
const app = require('../dist/app').default;

// Export the Express app as a Vercel serverless function
export default app;
