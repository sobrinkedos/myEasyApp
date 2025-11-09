/**
 * Script para aplicar migration de Counter Orders
 * Execute: node scripts/apply-counter-orders-migration.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config();

async function applyMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Ler o script SQL
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'apply_counter_orders.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Aplicando migration...');
    await client.query(sql);
    console.log('✅ Migration aplicada com sucesso!');

    // Verificar se as tabelas foram criadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('counter_orders', 'counter_order_items')
      ORDER BY table_name;
    `);

    console.log('\n📊 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Verificar enum
    const enumResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typname = 'CounterOrderStatus';
    `);

    if (enumResult.rows.length > 0) {
      console.log('  ✓ CounterOrderStatus (enum)');
    }

    console.log('\n🎉 Sistema de Pedidos Balcão está pronto para uso!');
    console.log('\n📚 Próximos passos:');
    console.log('  1. Execute: npx prisma generate');
    console.log('  2. Execute: npm run dev');
    console.log('  3. Acesse: http://localhost:3000/api/docs');

  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error.message);
    console.error('\n💡 Dica: Verifique se:');
    console.error('  - A variável DATABASE_URL está correta no .env');
    console.error('  - Você tem permissões no banco de dados');
    console.error('  - O banco de dados está acessível');
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão fechada.');
  }
}

applyMigration();
