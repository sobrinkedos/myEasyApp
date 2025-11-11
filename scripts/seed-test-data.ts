import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Função para baixar imagem da internet
async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const uploadsDir = path.join(process.cwd(), 'uploads', 'products');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, response.data);
    
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error(`Erro ao baixar imagem ${url}:`, error);
    return '';
  }
}

async function main() {
  console.log('🚀 Iniciando seed de dados de teste...\n');

  // 1. Criar empresa
  console.log('📍 Criando estabelecimento...');
  const establishment = await prisma.establishment.upsert({
    where: { cnpj: '12345678000190' },
    update: {},
    create: {
      name: 'Restaurante Sabor & Arte',
      cnpj: '12345678000190',
      phone: '(11) 98765-4321',
      email: 'contato@saborarte.com.br',
      address: {
        street: 'Rua das Flores',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
      taxSettings: {
        regime: 'simples',
        aliquota: 6.0,
      },
    },
  });
  console.log(`✅ Estabelecimento criado: ${establishment.name}\n`);

  // 2. Criar permissões do sistema
  console.log('🔐 Criando permissões...');
  const permissionsData = [
    // Stock Management
    { resource: 'stock-items', action: 'create', description: 'Criar itens de estoque' },
    { resource: 'stock-items', action: 'read', description: 'Visualizar itens de estoque' },
    { resource: 'stock-items', action: 'update', description: 'Atualizar itens de estoque' },
    { resource: 'stock-items', action: 'delete', description: 'Deletar itens de estoque' },
    { resource: 'stock-movements', action: 'create', description: 'Criar movimentações de estoque' },
    { resource: 'stock-movements', action: 'read', description: 'Visualizar movimentações' },
    
    // Products & Recipes
    { resource: 'products', action: 'create', description: 'Criar produtos' },
    { resource: 'products', action: 'read', description: 'Visualizar produtos' },
    { resource: 'products', action: 'update', description: 'Atualizar produtos' },
    { resource: 'products', action: 'delete', description: 'Deletar produtos' },
    { resource: 'recipes', action: 'create', description: 'Criar receitas' },
    { resource: 'recipes', action: 'read', description: 'Visualizar receitas' },
    { resource: 'recipes', action: 'update', description: 'Atualizar receitas' },
    { resource: 'recipes', action: 'delete', description: 'Deletar receitas' },
    { resource: 'ingredients', action: 'create', description: 'Criar ingredientes' },
    { resource: 'ingredients', action: 'read', description: 'Visualizar ingredientes' },
    { resource: 'ingredients', action: 'update', description: 'Atualizar ingredientes' },
    { resource: 'ingredients', action: 'delete', description: 'Deletar ingredientes' },
    
    // Categories
    { resource: 'categories', action: 'create', description: 'Criar categorias' },
    { resource: 'categories', action: 'read', description: 'Visualizar categorias' },
    { resource: 'categories', action: 'update', description: 'Atualizar categorias' },
    { resource: 'categories', action: 'delete', description: 'Deletar categorias' },
    
    // Users & Roles
    { resource: 'users', action: 'create', description: 'Criar usuários' },
    { resource: 'users', action: 'read', description: 'Visualizar usuários' },
    { resource: 'users', action: 'update', description: 'Atualizar usuários' },
    { resource: 'users', action: 'delete', description: 'Deletar usuários' },
    { resource: 'users', action: 'manage', description: 'Gerenciar usuários' },
    
    // Cash & Sales
    { resource: 'cash', action: 'open', description: 'Abrir caixa' },
    { resource: 'cash', action: 'close', description: 'Fechar caixa' },
    { resource: 'cash', action: 'read', description: 'Visualizar caixa' },
    { resource: 'sales', action: 'create', description: 'Criar vendas' },
    { resource: 'sales', action: 'read', description: 'Visualizar vendas' },
    
    // Commands & Orders
    { resource: 'commands', action: 'create', description: 'Criar comandas' },
    { resource: 'commands', action: 'read', description: 'Visualizar comandas' },
    { resource: 'commands', action: 'update', description: 'Atualizar comandas' },
    { resource: 'orders', action: 'create', description: 'Criar pedidos' },
    { resource: 'orders', action: 'read', description: 'Visualizar pedidos' },
    { resource: 'orders', action: 'update', description: 'Atualizar pedidos' },
    
    // Reports
    { resource: 'reports', action: 'read', description: 'Visualizar relatórios' },
    { resource: 'reports', action: 'export', description: 'Exportar relatórios' },
    
    // Establishment
    { resource: 'establishment', action: 'read', description: 'Visualizar estabelecimento' },
    { resource: 'establishment', action: 'update', description: 'Atualizar estabelecimento' },
  ];

  const permissions = [];
  for (const perm of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
    permissions.push(permission);
  }
  console.log(`✅ ${permissions.length} permissões criadas\n`);

  // 3. Criar role ADMIN com todas as permissões
  console.log('👑 Criando role ADMIN...');
  const adminRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'ADMIN', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador com acesso total',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });

  // Atribuir todas as permissões ao ADMIN
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }
  console.log(`✅ Role ADMIN criada com ${permissions.length} permissões\n`);

  // 4. Criar usuário admin
  console.log('👤 Criando usuário administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const user = await prisma.user.upsert({
    where: { email_establishmentId: { email: 'admin@saborarte.com.br', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'Admin Teste',
      email: 'admin@saborarte.com.br',
      password: hashedPassword,
      establishmentId: establishment.id,
      isActive: true,
      emailVerified: true,
    },
  });

  // Atribuir role ADMIN ao usuário
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
  });
  console.log(`✅ Usuário criado: ${user.email} com role ADMIN\n`);

  // 5. Criar categorias
  console.log('📂 Criando categorias...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Bebidas' },
      update: {},
      create: {
        name: 'Bebidas',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Pratos Principais' },
      update: {},
      create: {
        name: 'Pratos Principais',
        displayOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Sobremesas' },
      update: {},
      create: {
        name: 'Sobremesas',
        displayOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Petiscos' },
      update: {},
      create: {
        name: 'Petiscos',
        displayOrder: 4,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categorias criadas\n`);

  // 6. Criar ingredientes com SKU único
  console.log('🥘 Criando ingredientes...');
  
  const ingredientsData = [
    // Carnes
    { name: 'Filé Mignon', sku: 'ING-001', unit: 'KG', currentQuantity: 50, minimumQuantity: 10, averageCost: 89.90 },
    { name: 'Frango', sku: 'ING-002', unit: 'KG', currentQuantity: 80, minimumQuantity: 15, averageCost: 18.90 },
    { name: 'Camarão', sku: 'ING-003', unit: 'KG', currentQuantity: 30, minimumQuantity: 5, averageCost: 65.00 },
    // Massas e grãos
    { name: 'Arroz', sku: 'ING-004', unit: 'KG', currentQuantity: 100, minimumQuantity: 20, averageCost: 5.50 },
    { name: 'Feijão', sku: 'ING-005', unit: 'KG', currentQuantity: 80, minimumQuantity: 15, averageCost: 8.90 },
    { name: 'Macarrão', sku: 'ING-006', unit: 'KG', currentQuantity: 60, minimumQuantity: 10, averageCost: 7.50 },
    // Vegetais
    { name: 'Tomate', sku: 'ING-007', unit: 'KG', currentQuantity: 40, minimumQuantity: 10, averageCost: 4.50 },
    { name: 'Cebola', sku: 'ING-008', unit: 'KG', currentQuantity: 35, minimumQuantity: 8, averageCost: 3.20 },
    { name: 'Alho', sku: 'ING-009', unit: 'KG', currentQuantity: 15, minimumQuantity: 3, averageCost: 12.00 },
    { name: 'Batata', sku: 'ING-010', unit: 'KG', currentQuantity: 70, minimumQuantity: 15, averageCost: 3.80 },
    // Laticínios
    { name: 'Queijo Mussarela', sku: 'ING-011', unit: 'KG', currentQuantity: 25, minimumQuantity: 5, averageCost: 35.00 },
    { name: 'Creme de Leite', sku: 'ING-012', unit: 'L', currentQuantity: 20, minimumQuantity: 5, averageCost: 8.50 },
    { name: 'Manteiga', sku: 'ING-013', unit: 'KG', currentQuantity: 15, minimumQuantity: 3, averageCost: 22.00 },
    // Temperos e molhos
    { name: 'Azeite', sku: 'ING-014', unit: 'L', currentQuantity: 30, minimumQuantity: 5, averageCost: 28.00 },
    { name: 'Molho de Tomate', sku: 'ING-015', unit: 'KG', currentQuantity: 40, minimumQuantity: 10, averageCost: 6.50 },
    // Sobremesas
    { name: 'Chocolate', sku: 'ING-016', unit: 'KG', currentQuantity: 20, minimumQuantity: 5, averageCost: 45.00 },
    { name: 'Leite Condensado', sku: 'ING-017', unit: 'KG', currentQuantity: 25, minimumQuantity: 5, averageCost: 12.00 },
    { name: 'Morango', sku: 'ING-018', unit: 'KG', currentQuantity: 15, minimumQuantity: 3, averageCost: 18.00 },
  ];

  const ingredients = [];
  for (const ingData of ingredientsData) {
    // Buscar por SKU primeiro, se não existir, criar
    let ingredient = await prisma.ingredient.findFirst({
      where: { sku: ingData.sku },
    });

    if (!ingredient) {
      ingredient = await prisma.ingredient.create({
        data: ingData,
      });
    }
    
    ingredients.push(ingredient);
  }
  console.log(`✅ ${ingredients.length} ingredientes criados\n`);

  // 7. Criar receitas (deletar existentes primeiro para evitar duplicação)
  console.log('📖 Criando receitas...');
  
  // Deletar receitas existentes para evitar duplicação
  await prisma.recipe.deleteMany({
    where: {
      name: {
        in: [
          'Filé Mignon ao Molho Madeira',
          'Frango à Parmegiana',
          'Camarão ao Alho e Óleo',
          'Macarrão ao Molho Branco',
          'Petit Gateau',
          'Mousse de M
    data: {
      name: 'Filé Mignon ao Molho Madeira',
      description: 'Suculento filé mignon grelhado ao ponto, acompanhado de delicioso molho madeira cremoso',
      category: 'Pratos Principais',
      yield: 1,
      yieldUnit: 'porção',
      instructions: `1. Tempere o filé com sal e pimenta
2. Grelhe o filé em fogo alto por 3-4 minutos de cada lado
3. Reserve o filé e mantenha aquecido
4. Na mesma panela, adicione manteiga e cebola picada
5. Acrescente o creme de leite e o vinho madeira
6. Deixe reduzir até obter consistência cremosa
7. Sirva o filé coberto com o molho`,
      preparationTime: 30,
      ingredients: {
        create: [
          { ingredientId: ingredients[0].id, quantity: 0.3, unit: 'KG', cost: 26.97 }, // Filé Mignon
          { ingredientId: ingredients[11].id, quantity: 0.05, unit: 'L', cost: 0.43 }, // Creme de Leite
          { ingredientId: ingredients[12].id, quantity: 0.02, unit: 'KG', cost: 0.44 }, // Manteiga
          { ingredientId: ingredients[7].id, quantity: 0.05, unit: 'KG', cost: 0.16 }, // Cebola
        ],
      },
    },
  });

  const recipe2 = await prisma.recipe.create({
    data: {
      name: 'Frango à Parmegiana',
      description: 'Clássico frango empanado coberto com molho de tomate e queijo gratinado',
      category: 'Pratos Principais',
      yield: 1,
      yieldUnit: 'porção',
      instructions: `1. Tempere o frango e empane com farinha, ovo e farinha de rosca
2. Frite o frango até dourar
3. Coloque em uma assadeira
4. Cubra com molho de tomate
5. Adicione queijo mussarela por cima
6. Leve ao forno para gratinar
7. Sirva com arroz e batata frita`,
      preparationTime: 45,
      ingredients: {
        create: [
          { ingredientId: ingredients[1].id, quantity: 0.25, unit: 'KG', cost: 4.73 }, // Frango
          { ingredientId: ingredients[10].id, quantity: 0.1, unit: 'KG', cost: 3.50 }, // Queijo
          { ingredientId: ingredients[14].id, quantity: 0.15, unit: 'KG', cost: 0.98 }, // Molho de Tomate
          { ingredientId: ingredients[6].id, quantity: 0.05, unit: 'KG', cost: 0.23 }, // Tomate
        ],
      },
    },
  });

  const recipe3 = await prisma.recipe.create({
    data: {
      name: 'Camarão ao Alho e Óleo',
      description: 'Camarões frescos salteados no alho e azeite, com toque de pimenta',
      category: 'Petiscos',
      yield: 1,
      yieldUnit: 'porção',
      instructions: `1. Limpe os camarões
2. Em uma frigideira, aqueça o azeite
3. Adicione o alho picado e deixe dourar levemente
4. Acrescente os camarões
5. Tempere com sal e pimenta
6. Salteie por 5-7 minutos
7. Finalize com salsinha picada`,
      preparationTime: 20,
      ingredients: {
        create: [
          { ingredientId: ingredients[2].id, quantity: 0.2, unit: 'KG', cost: 13.00 }, // Camarão
          { ingredientId: ingredients[8].id, quantity: 0.02, unit: 'KG', cost: 0.24 }, // Alho
          { ingredientId: ingredients[13].id, quantity: 0.05, unit: 'L', cost: 1.40 }, // Azeite
        ],
      },
    },
  });

  const recipe4 = await prisma.recipe.create({
    data: {
      name: 'Macarrão ao Molho Branco',
      description: 'Macarrão al dente com cremoso molho branco e queijo',
      category: 'Pratos Principais',
      yield: 1,
      yieldUnit: 'porção',
      instructions: `1. Cozinhe o macarrão em água fervente com sal
2. Em uma panela, derreta a manteiga
3. Adicione o creme de leite
4. Acrescente o queijo ralado
5. Mexa até obter um molho cremoso
6. Escorra o macarrão e misture com o molho
7. Sirva imediatamente`,
      preparationTime: 25,
      ingredients: {
        create: [
          { ingredientId: ingredients[5].id, quantity: 0.15, unit: 'KG', cost: 1.13 }, // Macarrão
          { ingredientId: ingredients[11].id, quantity: 0.1, unit: 'L', cost: 0.85 }, // Creme de Leite
          { ingredientId: ingredients[10].id, quantity: 0.05, unit: 'KG', cost: 1.75 }, // Queijo
          { ingredientId: ingredients[12].id, quantity: 0.02, unit: 'KG', cost: 0.44 }, // Manteiga
        ],
      },
    },
  });

  const recipe5 = await prisma.recipe.create({
    data: {
      name: 'Petit Gateau',
      description: 'Bolinho de chocolate quente com recheio cremoso, servido com sorvete',
      category: 'Sobremesas',
      yield: 1,
      yieldUnit: 'porção',
      instructions: `1. Derreta o chocolate com a manteiga
2. Bata os ovos com açúcar
3. Misture o chocolate derretido
4. Adicione farinha de trigo
5. Unte forminhas e coloque a massa
6. Asse em forno pré-aquecido a 200°C por 8-10 minutos
7. Desenforme e sirva com sorvete`,
      preparationTime: 20,
      ingredients: {
        create: [
          { ingredientId: ingredients[15].id, quantity: 0.1, unit: 'KG', cost: 4.50 }, // Chocolate
          { ingredientId: ingredients[12].id, quantity: 0.05, unit: 'KG', cost: 1.10 }, // Manteiga
        ],
      },
    },
  });

  const recipe6 = await prisma.recipe.create({
    data: {
      name: 'Mousse de Morango',
      description: 'Sobremesa leve e cremosa de morango',
      category: 'Sobremesas',
      yield: 4,
      yieldUnit: 'porções',
      instructions: `1. Bata os morangos no liquidificador
2. Adicione o leite condensado
3. Acrescente o creme de leite
4. Bata até ficar homogêneo
5. Coloque em taças
6. Leve à geladeira por 2 horas
7. Decore com morangos frescos`,
      preparationTime: 15,
      ingredients: {
        create: [
          { ingredientId: ingredients[17].id, quantity: 0.3, unit: 'KG', cost: 5.40 }, // Morango
          { ingredientId: ingredients[16].id, quantity: 0.2, unit: 'KG', cost: 2.40 }, // Leite Condensado
          { ingredientId: ingredients[11].id, quantity: 0.2, unit: 'L', cost: 1.70 }, // Creme de Leite
        ],
      },
    },
  });

  console.log(`✅ 6 receitas criadas\n`);

  // 8. Criar produtos com receitas
  console.log('🍽️ Criando produtos com receitas...');
  
  await prisma.product.create({
    data: {
      name: 'Filé Mignon ao Molho Madeira',
      description: 'Suculento filé mignon grelhado ao ponto com molho madeira',
      price: 89.90,
      categoryId: categories[1].id,
      recipeId: recipe1.id,
      isActive: true,
      imageUrl: await downloadImage(
        'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
        'file-mignon.jpg'
      ),
    },
  });

  await prisma.product.create({
    data: {
      name: 'Frango à Parmegiana',
      description: 'Frango empanado com molho e queijo gratinado',
      price: 45.90,
      categoryId: categories[1].id,
      recipeId: recipe2.id,
      isActive: true,
      imageUrl: await downloadImage(
        'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800',
        'frango-parmegiana.jpg'
      ),
    },
  });

  await prisma.product.create({
    data: {
      name: 'Camarão ao Alho e Óleo',
      description: 'Camarões frescos salteados no alho e azeite',
      price: 68.90,
      categoryId: categories[3].id,
      recipeId: recipe3.id,
      isActive: true,
      imageUrl: await downloadImage(
        'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800',
        'camarao-alho.jpg'
      ),
    },
  });

  await prisma.product.create({
    data: {
      name: 'Macarrão ao Molho Branco',
      description: 'Macarrão com cremoso molho branco',
      price: 38.90,
      categoryId: categories[1].id,
      recipeId: recipe4.id,
      isActive: true,
      imageUrl: await downloadImage(
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
        'macarrao-branco.jpg'
      ),
    },
  });

  await prisma.product.create({
    data: {
      name: 'Petit Gateau',
      description: 'Bolinho de chocolate quente com sorvete',
      price: 28.90,
      categoryId: categories[2].id,
      recipeId: recipe5.id,
      isActive: true,
      imageUrl: await downloadImage(
        'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800',
        'petit-gateau.jpg'
      ),
    },
  });

  await prisma.product.create({
    data: {
      name: 'Mousse de Morango',
      description: 'Sobremesa leve e cremosa',
      price: 18.90,
      categoryId: categories[2].id,
      recipeId: recipe6.id,
      isActive: true,
      imageUrl: await downloadImage(
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
        'mousse-morango.jpg'
      ),
    },
  });

  console.log(`✅ 6 produtos com receitas criados\n`);

  // 9. Criar stock items de revenda (sem receita)
  console.log('🥤 Criando produtos de revenda...');
  
  // Criar stock items para produtos de revenda
  const stockItems = await Promise.all([
    prisma.stockItem.create({
      data: {
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante Coca-Cola lata 350ml gelada',
        category: 'Bebidas',
        unit: 'UN',
        currentQuantity: 100,
        minimumQuantity: 20,
        costPrice: 3.50,
        salePrice: 6.50,
        establishmentId: establishment.id,
        imageUrl: await downloadImage(
          'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
          'coca-cola.jpg'
        ),
      },
    }),
    prisma.stockItem.create({
      data: {
        name: 'Guaraná Antarctica 350ml',
        description: 'Refrigerante Guaraná Antarctica lata 350ml gelada',
        category: 'Bebidas',
        unit: 'UN',
        currentQuantity: 100,
        minimumQuantity: 20,
        costPrice: 2.80,
        salePrice: 5.50,
        establishmentId: establishment.id,
        imageUrl: await downloadImage(
          'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800',
          'guarana.jpg'
        ),
      },
    }),
    prisma.stockItem.create({
      data: {
        name: 'Água Mineral 500ml',
        description: 'Água mineral sem gás 500ml gelada',
        category: 'Bebidas',
        unit: 'UN',
        currentQuantity: 150,
        minimumQuantity: 30,
        costPrice: 1.50,
        salePrice: 3.50,
        establishmentId: establishment.id,
        imageUrl: await downloadImage(
          'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
          'agua.jpg'
        ),
      },
    }),
    prisma.stockItem.create({
      data: {
        name: 'Suco de Laranja Natural',
        description: 'Suco de laranja natural 300ml',
        category: 'Bebidas',
        unit: 'UN',
        currentQuantity: 50,
        minimumQuantity: 10,
        costPrice: 4.50,
        salePrice: 8.90,
        establishmentId: establishment.id,
        imageUrl: await downloadImage(
          'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
          'suco-laranja.jpg'
        ),
      },
    }),
    prisma.stockItem.create({
      data: {
        name: 'Cerveja Heineken Long Neck',
        description: 'Cerveja Heineken 330ml gelada',
        category: 'Bebidas',
        unit: 'UN',
        currentQuantity: 80,
        minimumQuantity: 15,
        costPrice: 7.50,
        salePrice: 12.90,
        establishmentId: establishment.id,
        imageUrl: await downloadImage(
          'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800',
          'heineken.jpg'
        ),
      },
    }),
    prisma.stockItem.create({
      data: {
        name: 'Batata Frita Porção',
        description: 'Porção de batata frita crocante',
        category: 'Petiscos',
        unit: 'UN',
        currentQuantity: 60,
        minimumQuantity: 10,
        costPrice: 8.50,
        salePrice: 22.90,
        establishmentId: establishment.id,
        imageUrl: await downloadImage(
          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800',
          'batata-frita.jpg'
        ),
      },
    }),
  ]);

  console.log(`✅ 6 stock items de revenda criados\n`);

  console.log('✨ Seed concluído com sucesso!\n');
  console.log('📊 Resumo:');
  console.log(`   - 1 estabelecimento: ${establishment.name}`);
  console.log(`   - 1 usuário: ${user.email} / senha: admin123`);
  console.log(`   - ${categories.length} categorias`);
  console.log(`   - ${ingredients.length} ingredientes`);
  console.log(`   - 6 receitas completas`);
  console.log(`   - 6 produtos manufaturados (com receitas)`);
  console.log(`   - 6 stock items para revenda`);
  console.log(`   - ${stockItems.length} itens de estoque`);
  console.log('\n🎉 Banco de dados populado e pronto para testes!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
