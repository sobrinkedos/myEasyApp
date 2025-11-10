#!/usr/bin/env node

/**
 * Script de Backup do Banco de Dados
 * 
 * Cria backup antes de migrations em produção
 * Mantém histórico dos últimos 10 backups
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configurações
const MAX_BACKUPS = 10;
const BACKUP_DIR = path.join(__dirname, '../backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                  new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];

// Cores
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

async function createBackup() {
  try {
    console.log('\n' + '='.repeat(60));
    log('blue', '💾', 'Iniciando backup do banco de dados...');
    console.log('='.repeat(60) + '\n');

    // Verificar DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      log('red', '❌', 'DATABASE_URL não configurada!');
      process.exit(1);
    }

    // Criar diretório de backups
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      log('green', '✅', `Diretório de backups criado: ${BACKUP_DIR}`);
    }

    // Nome do arquivo de backup
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
    
    log('blue', '🔄', 'Criando backup...');
    console.log(`📁 Arquivo: ${backupFile}\n`);

    // Executar pg_dump
    const command = `pg_dump "${dbUrl}" > "${backupFile}"`;
    
    try {
      await execAsync(command);
      
      // Verificar se arquivo foi criado
      if (fs.existsSync(backupFile)) {
        const stats = fs.statSync(backupFile);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        log('green', '✅', 'Backup criado com sucesso!');
        console.log(`📊 Tamanho: ${sizeMB} MB`);
        console.log(`📁 Local: ${backupFile}\n`);
        
        // Limpar backups antigos
        cleanOldBackups();
        
        return backupFile;
      } else {
        throw new Error('Arquivo de backup não foi criado');
      }
    } catch (error) {
      log('red', '❌', 'Erro ao executar pg_dump');
      console.error(error.message);
      
      log('yellow', '⚠️ ', 'Certifique-se de que pg_dump está instalado:');
      console.log('   - macOS: brew install postgresql');
      console.log('   - Ubuntu: sudo apt-get install postgresql-client');
      console.log('   - Windows: Instale PostgreSQL\n');
      
      process.exit(1);
    }
  } catch (error) {
    log('red', '❌', 'Erro ao criar backup:');
    console.error(error);
    process.exit(1);
  }
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUPS) {
      log('yellow', '🗑️ ', `Limpando backups antigos (mantendo ${MAX_BACKUPS} mais recentes)...`);
      
      const toDelete = files.slice(MAX_BACKUPS);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`   Removido: ${file.name}`);
      });
      
      console.log('');
    }
  } catch (error) {
    log('yellow', '⚠️ ', 'Erro ao limpar backups antigos:');
    console.error(error.message);
  }
}

function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        size: fs.statSync(path.join(BACKUP_DIR, f)).size,
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime
      }))
      .sort((a, b) => b.time.getTime() - a.time.getTime());

    if (files.length === 0) {
      log('yellow', 'ℹ️ ', 'Nenhum backup encontrado.');
      return;
    }

    console.log('\n' + '='.repeat(60));
    log('blue', '📋', `Backups disponíveis (${files.length}):`);
    console.log('='.repeat(60) + '\n');

    files.forEach((file, index) => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const date = file.time.toLocaleString('pt-BR');
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   Data: ${date}`);
      console.log(`   Tamanho: ${sizeMB} MB\n`);
    });
  } catch (error) {
    log('red', '❌', 'Erro ao listar backups:');
    console.error(error.message);
  }
}

// Executar
const command = process.argv[2];

if (command === 'list') {
  listBackups();
} else {
  createBackup()
    .then(() => {
      console.log('='.repeat(60));
      log('green', '🎉', 'Backup concluído com sucesso!');
      console.log('='.repeat(60) + '\n');
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
