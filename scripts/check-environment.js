#!/usr/bin/env node

/**
 * Script de Proteção de Ambiente
 * 
 * Previne operações destrutivas em produção
 * Garante que resets só aconteçam em desenvolvimento
 */

const environment = process.env.NODE_ENV || 'development';
const allowReset = process.env.ALLOW_DB_RESET === 'true';
const databaseUrl = process.env.DATABASE_URL || '';

// Detectar se é produção
const isProduction = 
  environment === 'production' || 
  (databaseUrl.includes('neon.tech') && !databaseUrl.includes('staging')) ||
  (databaseUrl.includes('neon.tech') && databaseUrl.includes('endpoint=main'));

// Detectar se é staging
const isStaging = 
  environment === 'staging' ||
  (databaseUrl.includes('neon.tech') && databaseUrl.includes('staging')) ||
  (databaseUrl.includes('neon.tech') && databaseUrl.includes('endpoint=staging'));

// Comando executado
const command = process.argv[2] || '';

// Comandos perigosos
const dangerousCommands = {
  'reset': 'prisma migrate reset',
  'push': 'prisma db push',
  'migrate': 'prisma migrate dev'
};

// Cores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, emoji, message) {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`);
}

function error(message) {
  log('red', '❌', message);
}

function warning(message) {
  log('yellow', '⚠️ ', message);
}

function success(message) {
  log('green', '✅', message);
}

function info(message) {
  log('blue', 'ℹ️ ', message);
}

// Verificar ambiente
console.log('\n' + '='.repeat(60));
log('blue', '🔍', 'Verificando ambiente...');
console.log('='.repeat(60));

console.log(`\nAmbiente: ${environment}`);
console.log(`Produção: ${isProduction ? 'SIM' : 'NÃO'}`);
console.log(`Staging: ${isStaging ? 'SIM' : 'NÃO'}`);
console.log(`Reset permitido: ${allowReset ? 'SIM' : 'NÃO'}`);
console.log(`Comando: ${command}\n`);

// BLOQUEIO 1: Operações destrutivas em produção
if (isProduction) {
  error('AMBIENTE DE PRODUÇÃO DETECTADO!');
  console.log('');
  
  if (Object.keys(dangerousCommands).some(cmd => command.includes(cmd))) {
    error('Operação BLOQUEADA: Comando destrutivo em produção!');
    console.log('');
    warning('Comandos destrutivos NÃO são permitidos em produção.');
    warning('Isso poderia causar PERDA DE DADOS!');
    console.log('');
    info('Use apenas: npm run migrate:deploy');
    info('Para aplicar migrations de forma segura.');
    console.log('');
    process.exit(1);
  }
}

// BLOQUEIO 2: Reset quando não permitido
if (!allowReset && command.includes('reset')) {
  error('Reset BLOQUEADO neste ambiente!');
  console.log('');
  warning('ALLOW_DB_RESET=false');
  warning('Para permitir resets, configure ALLOW_DB_RESET=true no .env');
  console.log('');
  
  if (isStaging || isProduction) {
    error('ATENÇÃO: Este ambiente parece ser staging ou produção!');
    error('Resets NÃO devem ser permitidos nestes ambientes.');
  }
  
  console.log('');
  process.exit(1);
}

// BLOQUEIO 3: Push em staging/produção
if ((isStaging || isProduction) && command.includes('push')) {
  error('db push BLOQUEADO em staging/produção!');
  console.log('');
  warning('Use migrations ao invés de db push:');
  info('1. npm run db:migrate -- --name sua_migration');
  info('2. npm run migrate:deploy');
  console.log('');
  process.exit(1);
}

// AVISO: Operações em staging
if (isStaging && Object.keys(dangerousCommands).some(cmd => command.includes(cmd))) {
  warning('ATENÇÃO: Operação em ambiente de STAGING!');
  warning('Certifique-se de que isso é intencional.');
  console.log('');
}

// Sucesso
success('Verificação de ambiente: OK');
console.log('='.repeat(60) + '\n');

process.exit(0);
