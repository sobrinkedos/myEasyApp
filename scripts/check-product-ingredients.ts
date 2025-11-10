/**
 * Script para verificar se produtos têm ingredientes cadastrados
 * 
 * Execute com: npx ts-node scripts/check-product-ingredients.ts
 */

import prisma from '../src/config/database';

async function checkProductIngredients() {
  console.log('=== Verificando Produtos e Ingredientes ===\n');

  // Buscar todos os produtos ativos
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      recipe: {
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      },
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  console.log(`Total de produtos ativos: ${products.length}\n`);

  let productsWithRecipe = 0;
  let productsWithDirectIngredients = 0;
  let productsWithoutIngredients = 0;

  for (const product of products) {
    const hasRecipe = product.recipe && product.recipe.ingredients.length > 0;
    const hasDirectIngredients = product.ingredients.length > 0;

    if (hasRecipe) {
      productsWithRecipe++;
      console.log(`✅ ${product.name} (${product.category.name})`);
      console.log(`   Receita: ${product.recipe!.name}`);
      console.log(`   Ingredientes da receita:`);
      product.recipe!.ingredients.forEach((ri) => {
        console.log(`     - ${ri.ingredient.name}: ${ri.quantity} ${ri.unit}`);
      });
      console.log('');
    } else if (hasDirectIngredients) {
      productsWithDirectIngredients++;
      console.log(`✅ ${product.name} (${product.category.name})`);
      console.log(`   Ingredientes diretos:`);
      product.ingredients.forEach((pi) => {
        console.log(`     - ${pi.ingredient.name}: ${pi.quantity} ${pi.ingredient.unit}`);
      });
      console.log('');
    } else {
      productsWithoutIngredients++;
      console.log(`❌ ${product.name} (${product.category.name})`);
      console.log(`   SEM INGREDIENTES CADASTRADOS`);
      console.log('');
    }
  }

  console.log('\n=== Resumo ===');
  console.log(`Produtos com receita: ${productsWithRecipe}`);
  console.log(`Produtos com ingredientes diretos: ${productsWithDirectIngredients}`);
  console.log(`Produtos SEM ingredientes: ${productsWithoutIngredients}`);
  console.log('');

  if (productsWithoutIngredients > 0) {
    console.log('⚠️  ATENÇÃO: Produtos sem ingredientes não terão baixa de estoque!');
    console.log('');
    console.log('Para adicionar ingredientes a um produto:');
    console.log('1. Crie uma receita e vincule ao produto, OU');
    console.log('2. Vincule ingredientes diretamente ao produto via API:');
    console.log('   POST /api/v1/ingredients/{ingredientId}/link-product');
    console.log('   Body: { "productId": "...", "quantity": 0.5 }');
  }

  // Verificar StockItems
  console.log('\n=== Verificando Stock Items (Produtos de Revenda) ===\n');
  
  const stockItems = await prisma.stockItem.findMany({
    where: { isActive: true },
  });

  console.log(`Total de stock items ativos: ${stockItems.length}`);
  
  if (stockItems.length > 0) {
    console.log('\nStock Items (não precisam de ingredientes):');
    stockItems.forEach((item) => {
      console.log(`  - ${item.name} (${item.category})`);
    });
  }

  await prisma.$disconnect();
}

checkProductIngredients()
  .catch((error) => {
    console.error('Erro ao verificar produtos:', error);
    process.exit(1);
  });
