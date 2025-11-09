import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // 1. Criar estabelecimento padrão
  const establishment = await prisma.establishment.upsert({
    where: { cnpj: '00000000000000' },
    update: {},
    create: {
      name: 'Estabelecimento Padrão',
      cnpj: '00000000000000',
      address: {
        street: 'Rua Exemplo',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
      phone: '(11) 1234-5678',
      email: 'contato@sistema.com',
      taxSettings: {
        taxRegime: 'Simples Nacional',
        icmsRate: 0,
        issRate: 2.5,
        pisRate: 0,
        cofinsRate: 0,
      },
    },
  });
  console.log('✅ Estabelecimento criado:', establishment.name);

  // 2. Criar permissões do sistema
  const permissions = [
    // Users
    { resource: 'users', action: 'create', description: 'Criar usuários' },
    { resource: 'users', action: 'read', description: 'Visualizar usuários' },
    { resource: 'users', action: 'update', description: 'Atualizar usuários' },
    { resource: 'users', action: 'delete', description: 'Deletar usuários' },
    { resource: 'users', action: 'manage', description: 'Gerenciar usuários' },
    
    // Products
    { resource: 'products', action: 'create', description: 'Criar produtos' },
    { resource: 'products', action: 'read', description: 'Visualizar produtos' },
    { resource: 'products', action: 'update', description: 'Atualizar produtos' },
    { resource: 'products', action: 'delete', description: 'Deletar produtos' },
    
    // Categories
    { resource: 'categories', action: 'create', description: 'Criar categorias' },
    { resource: 'categories', action: 'read', description: 'Visualizar categorias' },
    { resource: 'categories', action: 'update', description: 'Atualizar categorias' },
    { resource: 'categories', action: 'delete', description: 'Deletar categorias' },
    
    // Ingredients
    { resource: 'ingredients', action: 'create', description: 'Criar insumos' },
    { resource: 'ingredients', action: 'read', description: 'Visualizar insumos' },
    { resource: 'ingredients', action: 'update', description: 'Atualizar insumos' },
    { resource: 'ingredients', action: 'delete', description: 'Deletar insumos' },
    
    // Stock
    { resource: 'stock', action: 'create', description: 'Registrar movimentações de estoque' },
    { resource: 'stock', action: 'read', description: 'Visualizar estoque' },
    { resource: 'stock', action: 'update', description: 'Atualizar estoque' },
    
    // Sales
    { resource: 'sales', action: 'create', description: 'Criar vendas' },
    { resource: 'sales', action: 'read', description: 'Visualizar vendas' },
    { resource: 'sales', action: 'update', description: 'Atualizar vendas' },
    { resource: 'sales', action: 'cancel', description: 'Cancelar vendas' },
    
    // Cash
    { resource: 'cash', action: 'open', description: 'Abrir caixa' },
    { resource: 'cash', action: 'close', description: 'Fechar caixa' },
    { resource: 'cash', action: 'read', description: 'Visualizar caixa' },
    { resource: 'cash', action: 'withdrawal', description: 'Realizar sangria' },
    { resource: 'cash', action: 'supply', description: 'Realizar suprimento' },
    { resource: 'cash', action: 'reopen', description: 'Reabrir caixa' },
    { resource: 'cash', action: 'authorize', description: 'Autorizar operações de caixa' },
    
    // Treasury
    { resource: 'treasury', action: 'read', description: 'Visualizar tesouraria' },
    { resource: 'treasury', action: 'confirm', description: 'Confirmar recebimentos' },
    
    // Reports
    { resource: 'reports', action: 'read', description: 'Visualizar relatórios' },
    { resource: 'reports', action: 'financial', description: 'Visualizar relatórios financeiros' },
    { resource: 'reports', action: 'export', description: 'Exportar relatórios' },
    
    // Commands
    { resource: 'commands', action: 'create', description: 'Criar comandas' },
    { resource: 'commands', action: 'read', description: 'Visualizar comandas' },
    { resource: 'commands', action: 'update', description: 'Atualizar comandas' },
    { resource: 'commands', action: 'close', description: 'Fechar comandas' },
    
    // Orders
    { resource: 'orders', action: 'create', description: 'Criar pedidos' },
    { resource: 'orders', action: 'read', description: 'Visualizar pedidos' },
    { resource: 'orders', action: 'update', description: 'Atualizar pedidos' },
    { resource: 'orders', action: 'update-status', description: 'Atualizar status de pedidos' },
    { resource: 'orders', action: 'cancel', description: 'Cancelar pedidos' },
    
    // Tables
    { resource: 'tables', action: 'read', description: 'Visualizar mesas' },
    { resource: 'tables', action: 'manage', description: 'Gerenciar mesas' },
    
    // Customers
    { resource: 'customers', action: 'read', description: 'Visualizar clientes' },
    { resource: 'customers', action: 'manage', description: 'Gerenciar clientes' },
    
    // Deliveries
    { resource: 'deliveries', action: 'read', description: 'Visualizar entregas' },
    { resource: 'deliveries', action: 'update-status', description: 'Atualizar status de entregas' },
    
    // Establishment
    { resource: 'establishment', action: 'read', description: 'Visualizar estabelecimento' },
    { resource: 'establishment', action: 'update', description: 'Atualizar estabelecimento' },
    
    // Roles
    { resource: 'roles', action: 'create', description: 'Criar funções' },
    { resource: 'roles', action: 'read', description: 'Visualizar funções' },
    { resource: 'roles', action: 'update', description: 'Atualizar funções' },
    { resource: 'roles', action: 'delete', description: 'Deletar funções' },
    
    // Permissions
    { resource: 'permissions', action: 'read', description: 'Visualizar permissões' },
    { resource: 'permissions', action: 'delegate', description: 'Delegar permissões' },
    
    // Audit
    { resource: 'audit', action: 'read', description: 'Visualizar auditoria' },
    { resource: 'audit', action: 'export', description: 'Exportar auditoria' },
    
    // Profile
    { resource: 'profile', action: 'update', description: 'Atualizar próprio perfil' },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
    createdPermissions.push(permission);
  }
  console.log(`✅ ${createdPermissions.length} permissões criadas`);

  // 3. Criar funções do sistema
  
  // SUPER_ADMIN - Acesso total (global, sem estabelecimento específico)
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrador com acesso total ao sistema',
      isSystem: true,
      establishmentId: establishment.id, // Vinculado ao estabelecimento padrão
    },
  }).catch(async () => {
    // Se já existe, buscar
    return await prisma.role.findFirst({
      where: { name: 'SUPER_ADMIN', establishmentId: establishment.id }
    }) as any;
  });
  
  // Atribuir todas as permissões ao SUPER_ADMIN
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função SUPER_ADMIN criada com todas as permissões');

  // ADMIN - Administrador do estabelecimento
  const adminRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'ADMIN', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador do estabelecimento',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });
  
  const adminPermissions = createdPermissions.filter(p => 
    !['permissions:delegate', 'audit:export'].includes(`${p.resource}:${p.action}`)
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função ADMIN criada');

  // MANAGER - Gerente
  const managerRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'MANAGER', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Gerente com acesso a relatórios e supervisão',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });
  
  const managerPermissions = createdPermissions.filter(p => 
    ['products:read', 'sales', 'cash:read', 'reports', 'stock:read', 'users:read', 'orders:read'].some(prefix => 
      `${p.resource}:${p.action}`.startsWith(prefix)
    )
  );
  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: managerRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: managerRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função MANAGER criada');

  // SUPERVISOR - Supervisor
  const supervisorRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'SUPERVISOR', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'SUPERVISOR',
      description: 'Supervisor com permissões de autorização',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });
  
  const supervisorPermissions = createdPermissions.filter(p => 
    ['sales:cancel', 'cash:reopen', 'cash:authorize', 'products:read', 'stock:read'].includes(`${p.resource}:${p.action}`)
  );
  for (const permission of supervisorPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: supervisorRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: supervisorRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função SUPERVISOR criada');

  // CASH_OPERATOR - Operador de Caixa
  const cashOperatorRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'CASH_OPERATOR', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'CASH_OPERATOR',
      description: 'Operador de caixa',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });
  
  const cashOperatorPermissions = createdPermissions.filter(p => 
    ['cash:open', 'cash:close', 'cash:withdrawal', 'cash:supply', 'sales:create', 'sales:read', 'products:read'].includes(`${p.resource}:${p.action}`)
  );
  for (const permission of cashOperatorPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: cashOperatorRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: cashOperatorRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função CASH_OPERATOR criada');

  // WAITER - Garçom
  const waiterRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'WAITER', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'WAITER',
      description: 'Garçom',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });
  
  const waiterPermissions = createdPermissions.filter(p => 
    ['commands', 'orders', 'tables:read', 'products:read', 'customers:read'].some(prefix => 
      `${p.resource}:${p.action}`.startsWith(prefix)
    )
  );
  for (const permission of waiterPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: waiterRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: waiterRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função WAITER criada');

  // KITCHEN - Cozinha
  const kitchenRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'KITCHEN', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'KITCHEN',
      description: 'Cozinha',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });
  
  const kitchenPermissions = createdPermissions.filter(p => 
    ['orders:read', 'orders:update-status', 'products:read'].includes(`${p.resource}:${p.action}`)
  );
  for (const permission of kitchenPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: kitchenRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: kitchenRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função KITCHEN criada');

  // TREASURER - Tesoureiro
  const treasurerRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'TREASURER', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'TREASURER',
      description: 'Tesoureiro',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });
  
  const treasurerPermissions = createdPermissions.filter(p => 
    ['treasury', 'cash:read', 'reports:financial'].some(prefix => 
      `${p.resource}:${p.action}`.startsWith(prefix)
    )
  );
  for (const permission of treasurerPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: treasurerRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: treasurerRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função TREASURER criada');

  // DELIVERY - Entregador
  const deliveryRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'DELIVERY', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'DELIVERY',
      description: 'Entregador',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });
  
  const deliveryPermissions = createdPermissions.filter(p => 
    ['deliveries:read', 'deliveries:update-status'].includes(`${p.resource}:${p.action}`)
  );
  for (const permission of deliveryPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: deliveryRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: deliveryRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função DELIVERY criada');

  // CUSTOMER - Cliente
  const customerRole = await prisma.role.upsert({
    where: { name_establishmentId: { name: 'CUSTOMER', establishmentId: establishment.id } },
    update: {},
    create: {
      name: 'CUSTOMER',
      description: 'Cliente',
      isSystem: true,
      establishmentId: establishment.id,
    },
  });
  
  const customerPermissions = createdPermissions.filter(p => 
    ['orders:create', 'products:read', 'profile:update'].includes(`${p.resource}:${p.action}`)
  );
  for (const permission of customerPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: customerRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: customerRole.id, permissionId: permission.id },
    });
  }
  console.log('✅ Função CUSTOMER criada');

  // 4. Criar usuário SUPER_ADMIN
  const randomPassword = crypto.randomBytes(8).toString('hex');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email_establishmentId: { email: 'admin@sistema.com', establishmentId: establishment.id } },
    update: {},
    create: {
      email: 'admin@sistema.com',
      password: hashedPassword,
      name: 'Super Administrador',
      establishmentId: establishment.id,
      emailVerified: true,
      twoFactorEnabled: false,
    },
  });

  // Atribuir função SUPER_ADMIN
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdmin.id, roleId: superAdminRole.id },
  });

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📧 Credenciais do Super Administrador:');
  console.log(`   Email: admin@sistema.com`);
  console.log(`   Senha: ${randomPassword}`);
  console.log('\n⚠️  IMPORTANTE: Guarde esta senha em local seguro!\n');

  // 5. Criar categorias de exemplo
  const categories = [
    { name: 'Entradas', displayOrder: 1 },
    { name: 'Pratos Principais', displayOrder: 2 },
    { name: 'Bebidas', displayOrder: 3 },
    { name: 'Sobremesas', displayOrder: 4 },
    { name: 'Lanches', displayOrder: 5 },
  ];

  const createdCategories: any = {};
  for (const category of categories) {
    const cat = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    createdCategories[category.name] = cat;
  }
  console.log('✅ Categorias de exemplo criadas');

  // 6. Criar ingredientes
  const ingredients = [
    { name: 'Filé Mignon', unit: 'kg', currentQuantity: 10, minimumQuantity: 2, averageCost: 65.00 },
    { name: 'Batata', unit: 'kg', currentQuantity: 20, minimumQuantity: 5, averageCost: 4.50 },
    { name: 'Alface', unit: 'un', currentQuantity: 15, minimumQuantity: 3, averageCost: 2.50 },
    { name: 'Tomate', unit: 'kg', currentQuantity: 8, minimumQuantity: 2, averageCost: 5.00 },
    { name: 'Queijo Mussarela', unit: 'kg', currentQuantity: 5, minimumQuantity: 1, averageCost: 35.00 },
    { name: 'Pão Francês', unit: 'un', currentQuantity: 50, minimumQuantity: 20, averageCost: 0.80 },
    { name: 'Óleo', unit: 'l', currentQuantity: 10, minimumQuantity: 2, averageCost: 8.00 },
    { name: 'Sal', unit: 'kg', currentQuantity: 5, minimumQuantity: 1, averageCost: 2.00 },
    { name: 'Açúcar', unit: 'kg', currentQuantity: 10, minimumQuantity: 2, averageCost: 3.50 },
    { name: 'Farinha de Trigo', unit: 'kg', currentQuantity: 15, minimumQuantity: 3, averageCost: 4.00 },
  ];

  const createdIngredients: any = {};
  for (const ingredient of ingredients) {
    const ing = await prisma.ingredient.create({
      data: ingredient,
    });
    createdIngredients[ingredient.name] = ing;
  }
  console.log('✅ Ingredientes criados');

  // 7. Criar receitas
  const fileComFritasRecipe = await prisma.recipe.create({
    data: {
      name: 'Filé com Fritas',
      category: 'Pratos Principais',
      yield: 1,
      yieldUnit: 'porção',
      preparationTime: 30,
      instructions: '1. Tempere o filé\n2. Grelhe o filé\n3. Frite as batatas\n4. Sirva',
      ingredients: {
        create: [
          { ingredientId: createdIngredients['Filé Mignon'].id, quantity: 0.3, unit: 'kg', cost: 19.50 },
          { ingredientId: createdIngredients['Batata'].id, quantity: 0.4, unit: 'kg', cost: 1.80 },
          { ingredientId: createdIngredients['Óleo'].id, quantity: 0.1, unit: 'l', cost: 0.80 },
          { ingredientId: createdIngredients['Sal'].id, quantity: 0.01, unit: 'kg', cost: 0.02 },
        ],
      },
    },
  });
  await prisma.recipe.update({
    where: { id: fileComFritasRecipe.id },
    data: { totalCost: 22.12, costPerPortion: 22.12 },
  });

  const hamburguerRecipe = await prisma.recipe.create({
    data: {
      name: 'Hambúrguer Artesanal',
      category: 'Lanches',
      yield: 1,
      yieldUnit: 'porção',
      preparationTime: 15,
      instructions: '1. Grelhe o hambúrguer\n2. Torre o pão\n3. Monte com queijo, alface e tomate',
      ingredients: {
        create: [
          { ingredientId: createdIngredients['Filé Mignon'].id, quantity: 0.15, unit: 'kg', cost: 9.75 },
          { ingredientId: createdIngredients['Pão Francês'].id, quantity: 1, unit: 'un', cost: 0.80 },
          { ingredientId: createdIngredients['Queijo Mussarela'].id, quantity: 0.05, unit: 'kg', cost: 1.75 },
          { ingredientId: createdIngredients['Alface'].id, quantity: 0.5, unit: 'un', cost: 1.25 },
          { ingredientId: createdIngredients['Tomate'].id, quantity: 0.05, unit: 'kg', cost: 0.25 },
        ],
      },
    },
  });
  await prisma.recipe.update({
    where: { id: hamburguerRecipe.id },
    data: { totalCost: 13.80, costPerPortion: 13.80 },
  });

  const saladaRecipe = await prisma.recipe.create({
    data: {
      name: 'Salada Caesar',
      category: 'Entradas',
      yield: 1,
      yieldUnit: 'porção',
      preparationTime: 10,
      instructions: '1. Lave e corte a alface\n2. Adicione tomate\n3. Finalize com queijo ralado',
      ingredients: {
        create: [
          { ingredientId: createdIngredients['Alface'].id, quantity: 1, unit: 'un', cost: 2.50 },
          { ingredientId: createdIngredients['Tomate'].id, quantity: 0.1, unit: 'kg', cost: 0.50 },
          { ingredientId: createdIngredients['Queijo Mussarela'].id, quantity: 0.03, unit: 'kg', cost: 1.05 },
        ],
      },
    },
  });
  await prisma.recipe.update({
    where: { id: saladaRecipe.id },
    data: { totalCost: 4.05, costPerPortion: 4.05 },
  });

  console.log('✅ Receitas criadas');

  // 8. Criar produtos manufaturados com imagens
  const products = [
    {
      name: 'Filé com Fritas',
      description: 'Delicioso filé mignon grelhado acompanhado de batatas fritas crocantes',
      price: 45.00,
      categoryId: createdCategories['Pratos Principais'].id,
      recipeId: fileComFritasRecipe.id,
      preparationTime: 30,
      imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
    },
    {
      name: 'Hambúrguer Artesanal',
      description: 'Hambúrguer de carne nobre com queijo, alface e tomate no pão artesanal',
      price: 28.00,
      categoryId: createdCategories['Lanches'].id,
      recipeId: hamburguerRecipe.id,
      preparationTime: 15,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    },
    {
      name: 'Salada Caesar',
      description: 'Salada fresca com alface, tomate e queijo parmesão',
      price: 18.00,
      categoryId: createdCategories['Entradas'].id,
      recipeId: saladaRecipe.id,
      preparationTime: 10,
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: { ...product, isActive: true } });
  }
  console.log('✅ Produtos manufaturados criados');

  // 9. Criar produtos de revenda (bebidas) com imagens
  const beverageProducts = [
    {
      name: 'Cerveja Brahma 350ml',
      description: 'Cerveja gelada em lata 350ml',
      price: 8.00,
      categoryId: createdCategories['Bebidas'].id,
      imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
    },
    {
      name: 'Coca-Cola 350ml',
      description: 'Refrigerante Coca-Cola lata 350ml',
      price: 6.00,
      categoryId: createdCategories['Bebidas'].id,
      imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
    },
    {
      name: 'Água Mineral 500ml',
      description: 'Água mineral sem gás 500ml',
      price: 3.50,
      categoryId: createdCategories['Bebidas'].id,
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
    },
    {
      name: 'Suco de Laranja Natural',
      description: 'Suco natural de laranja 300ml',
      price: 7.00,
      categoryId: createdCategories['Bebidas'].id,
      imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    },
    {
      name: 'Café Expresso',
      description: 'Café expresso tradicional',
      price: 5.00,
      categoryId: createdCategories['Bebidas'].id,
      imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    },
  ];

  for (const product of beverageProducts) {
    await prisma.product.create({ data: { ...product, isActive: true, preparationTime: 5 } });
  }
  console.log('✅ Produtos de bebidas criados');

  // 10. Criar produtos de sobremesa com imagens
  const dessertProducts = [
    {
      name: 'Pudim de Leite',
      description: 'Pudim de leite condensado com calda de caramelo',
      price: 12.00,
      categoryId: createdCategories['Sobremesas'].id,
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    },
    {
      name: 'Brownie com Sorvete',
      description: 'Brownie de chocolate quente com sorvete de creme',
      price: 15.00,
      categoryId: createdCategories['Sobremesas'].id,
      imageUrl: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400',
    },
    {
      name: 'Petit Gateau',
      description: 'Bolinho de chocolate com recheio cremoso e sorvete',
      price: 18.00,
      categoryId: createdCategories['Sobremesas'].id,
      imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
    },
  ];

  for (const product of dessertProducts) {
    await prisma.product.create({ data: { ...product, isActive: true, preparationTime: 10 } });
  }
  console.log('✅ Produtos de sobremesas criados');

  // 11. Criar itens de estoque (para controle de revenda)
  const stockItems = [
    { name: 'Cerveja Brahma 350ml lata', category: 'Bebidas', unit: 'un', currentQuantity: 100, minimumQuantity: 20, costPrice: 3.50, salePrice: 8.00, imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400' },
    { name: 'Refrigerante Coca-Cola 350ml lata', category: 'Bebidas', unit: 'un', currentQuantity: 80, minimumQuantity: 15, costPrice: 2.80, salePrice: 6.00, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
    { name: 'Água Mineral 500ml', category: 'Bebidas', unit: 'un', currentQuantity: 120, minimumQuantity: 30, costPrice: 1.20, salePrice: 3.50, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400' },
    { name: 'Suco Natural Laranja 300ml', category: 'Bebidas', unit: 'un', currentQuantity: 40, minimumQuantity: 10, costPrice: 3.00, salePrice: 7.00, imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
  ];

  for (const item of stockItems) {
    await prisma.stockItem.create({
      data: {
        ...item,
        establishmentId: establishment.id,
      },
    });
  }
  console.log('✅ Itens de estoque criados');

  // 12. Criar mesas
  const tables = [
    { number: 1, capacity: 2, establishmentId: establishment.id },
    { number: 2, capacity: 4, establishmentId: establishment.id },
    { number: 3, capacity: 4, establishmentId: establishment.id },
    { number: 4, capacity: 6, establishmentId: establishment.id },
    { number: 5, capacity: 2, establishmentId: establishment.id },
    { number: 6, capacity: 8, establishmentId: establishment.id },
    { number: 7, capacity: 4, establishmentId: establishment.id },
    { number: 8, capacity: 4, establishmentId: establishment.id },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { establishmentId_number: { establishmentId: table.establishmentId, number: table.number } },
      update: {},
      create: table,
    });
  }
  console.log('✅ Mesas criadas');

  // 13. Criar caixa
  await prisma.cashRegister.upsert({
    where: { number_establishmentId: { number: 1, establishmentId: establishment.id } },
    update: {},
    create: {
      number: 1,
      name: 'Caixa Principal',
      establishmentId: establishment.id,
      isActive: true,
    },
  });
  console.log('✅ Caixa criado');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
