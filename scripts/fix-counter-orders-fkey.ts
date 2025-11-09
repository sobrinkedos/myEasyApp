/**
 * Script para corrigir foreign key constraint de counter_order_items
 * Remove a constraint que força productId a referenciar apenas Product
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Iniciando correção da foreign key constraint...');

  try {
    // Remover a constraint existente
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "counter_order_items" 
      DROP CONSTRAINT IF EXISTS "counter_order_items_productId_fkey"
    `);
    console.log('✅ Constraint removida com sucesso!');

    // Criar índice para melhorar performance
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "counter_order_items_productId_idx" 
      ON "counter_order_items"("productId")
    `);
    console.log('✅ Índice criado com sucesso!');

    console.log('');
    console.log('🎉 Correção aplicada com sucesso!');
    console.log('📝 Agora counter_order_items aceita tanto produtos manufaturados quanto stock items.');
  } catch (error) {
    console.error('❌ Erro ao aplicar correção:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
