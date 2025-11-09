/**
 * Script para aplicar migration de Counter Orders usando Prisma
 * Execute: npx ts-node scripts/apply-counter-orders-migration-prisma.ts
 */

import prisma from '../src/config/database';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    
    // Testar conexão
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conectado com sucesso!');

    // Ler o script SQL
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'apply_counter_orders.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Aplicando migration...');
    
    // Executar o SQL
    await prisma.$executeRawUnsafe(sql);
    
    console.log('✅ Migration aplicada com sucesso!');

    // Verificar se as tabelas foram criadas
    const result = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('counter_orders', 'counter_order_items')
      ORDER BY table_name
    `;

    console.log('\n📊 Tabelas criadas:');
    result.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Verificar enum
    const enumResult = await prisma.$queryRaw<Array<{ typname: string }>>`
      SELECT typname 
      FROM pg_type 
      WHERE typname = 'CounterOrderStatus'
    `;

    if (enumResult.length > 0) {
      console.log('  ✓ CounterOrderStatus (enum)');
    }

    console.log('\n🎉 Sistema de Pedidos Balcão está pronto para uso!');
    console.log('\n📚 Próximos passos:');
    console.log('  1. Execute: npx prisma generate');
    console.log('  2. Execute: npm run dev');
    console.log('  3. Acesse: http://localhost:3000/api/docs');

  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    console.error('\n💡 Dica: Verifique se:');
    console.error('  - A variável DATABASE_URL está correta no .env');
    console.error('  - Você tem permissões no banco de dados');
    console.error('  - O banco de dados está acessível');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão fechada.');
  }
}

applyMigration();
