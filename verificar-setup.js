/**
 * Script de Verificação do Setup
 * Execute: node verificar-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando Setup do Projeto...\n');

let errors = 0;
let warnings = 0;

// Verificar Node.js
console.log('1️⃣  Verificando Node.js...');
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
if (nodeMajor >= 20) {
  console.log(`   ✅ Node.js ${nodeVersion} (OK)\n`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} (Requer >= 20.0.0)\n`);
  errors++;
}

// Verificar package.json
console.log('2️⃣  Verificando package.json...');
if (fs.existsSync('package.json')) {
  console.log('   ✅ package.json encontrado\n');
} else {
  console.log('   ❌ package.json não encontrado\n');
  errors++;
}

// Verificar node_modules
console.log('3️⃣  Verificando dependências...');
if (fs.existsSync('node_modules')) {
  console.log('   ✅ node_modules encontrado\n');
} else {
  console.log('   ⚠️  node_modules não encontrado\n');
  console.log('   💡 Execute: npm install\n');
  warnings++;
}

// Verificar .env.development
console.log('4️⃣  Verificando arquivo de ambiente...');
if (fs.existsSync('.env.development')) {
  console.log('   ✅ .env.development encontrado');
  
  // Ler e verificar variáveis importantes
  const envContent = fs.readFileSync('.env.development', 'utf8');
  
  const requiredVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'PORT'
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName + '=')) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    console.log('   ✅ Todas as variáveis necessárias estão definidas\n');
  } else {
    console.log(`   ⚠️  Variáveis faltando: ${missingVars.join(', ')}\n`);
    warnings++;
  }
  
  // Verificar se DATABASE_URL está configurado
  if (envContent.includes('DATABASE_URL=postgresql://')) {
    const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1];
    if (dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('user:password@host')) {
      console.log('   ✅ DATABASE_URL parece configurado\n');
    } else {
      console.log('   ⚠️  DATABASE_URL precisa ser configurado\n');
      console.log('   💡 Use Neon (https://neon.tech) ou configure PostgreSQL local\n');
      warnings++;
    }
  }
  
  // Verificar se REDIS_URL está configurado
  if (envContent.includes('REDIS_URL=redis')) {
    const redisUrl = envContent.match(/REDIS_URL=(.+)/)?.[1];
    if (redisUrl && !redisUrl.includes('localhost') && !redisUrl.includes('password@host')) {
      console.log('   ✅ REDIS_URL parece configurado\n');
    } else {
      console.log('   ⚠️  REDIS_URL precisa ser configurado\n');
      console.log('   💡 Use Upstash (https://upstash.com) ou configure Redis local\n');
      warnings++;
    }
  }
  
} else {
  console.log('   ⚠️  .env.development não encontrado\n');
  console.log('   💡 Copie .env.development.example para .env.development\n');
  warnings++;
}

// Verificar Prisma
console.log('5️⃣  Verificando Prisma...');
if (fs.existsSync('prisma/schema.prisma')) {
  console.log('   ✅ schema.prisma encontrado');
} else {
  console.log('   ❌ schema.prisma não encontrado\n');
  errors++;
}

if (fs.existsSync('node_modules/.prisma')) {
  console.log('   ✅ Cliente Prisma gerado\n');
} else {
  console.log('   ⚠️  Cliente Prisma não gerado\n');
  console.log('   💡 Execute: npm run prisma:generate\n');
  warnings++;
}

// Verificar estrutura de diretórios
console.log('6️⃣  Verificando estrutura do projeto...');
const requiredDirs = [
  'src',
  'src/config',
  'src/controllers',
  'src/services',
  'src/repositories',
  'src/middlewares',
  'src/routes',
  'src/utils',
  'prisma'
];

let missingDirs = [];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    missingDirs.push(dir);
  }
});

if (missingDirs.length === 0) {
  console.log('   ✅ Estrutura de diretórios OK\n');
} else {
  console.log(`   ❌ Diretórios faltando: ${missingDirs.join(', ')}\n`);
  errors++;
}

// Verificar arquivos principais
console.log('7️⃣  Verificando arquivos principais...');
const requiredFiles = [
  'src/app.ts',
  'src/server.ts',
  'tsconfig.json',
  'package.json'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log('   ✅ Arquivos principais OK\n');
} else {
  console.log(`   ❌ Arquivos faltando: ${missingFiles.join(', ')}\n`);
  errors++;
}

// Verificar guias de documentação
console.log('8️⃣  Verificando documentação...');
const docFiles = [
  'LEIA_ME_PRIMEIRO.md',
  'INICIO_RAPIDO_SEM_DOCKER.md',
  'SETUP_ONLINE.md',
  'START_HERE.md',
  'README.md'
];

let foundDocs = 0;
docFiles.forEach(file => {
  if (fs.existsSync(file)) {
    foundDocs++;
  }
});

console.log(`   ✅ ${foundDocs}/${docFiles.length} guias encontrados\n`);

// Resumo final
console.log('═══════════════════════════════════════════════════════');
console.log('📊 RESUMO DA VERIFICAÇÃO\n');

if (errors === 0 && warnings === 0) {
  console.log('🎉 TUDO PERFEITO!\n');
  console.log('✅ Projeto configurado corretamente');
  console.log('✅ Todas as dependências instaladas');
  console.log('✅ Variáveis de ambiente configuradas\n');
  console.log('🚀 Próximos passos:');
  console.log('   1. Execute: npm run prisma:migrate');
  console.log('   2. Execute: npm run prisma:seed');
  console.log('   3. Execute: npm run dev');
  console.log('   4. Teste: node test-api.js\n');
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} erro(s) encontrado(s)`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} aviso(s) encontrado(s)\n`);
  }
  
  console.log('📋 AÇÕES NECESSÁRIAS:\n');
  
  if (!fs.existsSync('node_modules')) {
    console.log('1. Instalar dependências:');
    console.log('   npm install\n');
  }
  
  if (!fs.existsSync('.env.development')) {
    console.log('2. Configurar ambiente:');
    console.log('   - Copie .env.development.example para .env.development');
    console.log('   - Configure DATABASE_URL e REDIS_URL\n');
  }
  
  if (!fs.existsSync('node_modules/.prisma')) {
    console.log('3. Gerar cliente Prisma:');
    console.log('   npm run prisma:generate\n');
  }
  
  console.log('💡 DICA: Siga o guia INICIO_RAPIDO_SEM_DOCKER.md\n');
}

console.log('═══════════════════════════════════════════════════════\n');

// Verificar se pode testar conexões
if (fs.existsSync('.env.development') && fs.existsSync('node_modules')) {
  console.log('🔌 Quer testar as conexões agora? (Requer serviços rodando)');
  console.log('   Execute: node test-api.js\n');
}

process.exit(errors > 0 ? 1 : 0);
