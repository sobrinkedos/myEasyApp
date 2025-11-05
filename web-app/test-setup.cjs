// Quick test script to verify setup
const fs = require('fs');
const path = require('path');

console.log('🧪 Verificando setup do frontend...\n');

const checks = [
  { file: 'package.json', desc: 'Package.json' },
  { file: 'tsconfig.json', desc: 'TypeScript config' },
  { file: 'vite.config.ts', desc: 'Vite config' },
  { file: 'tailwind.config.js', desc: 'Tailwind config' },
  { file: 'src/main.tsx', desc: 'Entry point' },
  { file: 'src/app/App.tsx', desc: 'App component' },
  { file: 'src/app/router.tsx', desc: 'Router' },
  { file: 'src/layouts/AuthLayout.tsx', desc: 'Auth layout' },
  { file: 'src/layouts/DashboardLayout.tsx', desc: 'Dashboard layout' },
  { file: 'src/components/common/Sidebar.tsx', desc: 'Sidebar' },
  { file: 'src/components/common/Topbar.tsx', desc: 'Topbar' },
  { file: 'src/components/common/Breadcrumbs.tsx', desc: 'Breadcrumbs' },
  { file: 'src/components/common/Icon.tsx', desc: 'Icon component' },
  { file: 'src/pages/auth/LoginPage.tsx', desc: 'Login page' },
  { file: 'src/pages/dashboard/DashboardPage.tsx', desc: 'Dashboard page' },
];

let allGood = true;

checks.forEach(({ file, desc }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${desc}`);
  } else {
    console.log(`❌ ${desc} - FALTANDO`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ Todos os arquivos estão presentes!');
  console.log('\n📦 Próximos passos:');
  console.log('1. npm install');
  console.log('2. npm run dev');
  console.log('3. Abrir http://localhost:5173');
} else {
  console.log('❌ Alguns arquivos estão faltando!');
  console.log('Verifique os erros acima.');
}

console.log('='.repeat(50) + '\n');
