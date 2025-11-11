import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando limpeza de dados duplicados...\n');

  // 1. Deletar produtos (que dependem de receitas)
  console.log('🗑️  Deletando produtos...');
  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`✅ ${deletedProducts.count} produtos deletados\n`);

  // 2. Deletar receitas (que dependem de ingredientes)
  console.log('🗑️  Deletando receitas...');
  const deletedRecipes = await prisma.recipe.deleteMany({});
  console.log(`✅ ${deletedRecipes.count} receitas deletadas\n`);

  // 3. Deletar ingredientes duplicados
  console.log('🗑️  Deletando ingredientes...');
  const deletedIngredients = await prisma.ingredient.deleteMany({});
  console.log(`✅ ${deletedIngredients.count} ingredientes deletados\n`);

  // 4. Deletar stock items
  console.log('🗑️  Deletando stock items...');
  const deletedStockItems = await prisma.stockItem.deleteMany({});
  console.log(`✅ ${deletedStockItems.count} stock items deletados\n`);

  // 5. Deletar categorias (se necessário)
  console.log('🗑️  Deletando categorias...');
  const deletedCategories = await prisma.category.deleteMany({});
  console.log(`✅ ${deletedCategories.count} categorias deletadas\n`);

  console.log('✨ Limpeza concluída!\n');
  console.log('📝 Próximo passo: Execute o seed novamente');
  console.log('   seed-test-data.bat\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao limpar dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
