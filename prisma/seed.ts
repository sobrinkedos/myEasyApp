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
  
  // Calcular custo total da receita
  await prisma.recipe.update({
    where: { id: fileComFritasRecipe.id },
    data: {
      totalCost: 22.12,
      costPerPortion: 22.12,
    },
  });
  console.log('✅ Receita "Filé com Fritas" criada');

  // 8. Criar produtos manufaturados
  await prisma.product.create({
    data: {
      name: 'Filé com Fritas',
      description: 'Delicioso filé mignon grelhado acompanhado de batatas fritas crocantes',
      price: 35.00,
      categoryId: createdCategories['Pratos Principais'].id,
      recipeId: fileComFritasRecipe.id,
      preparationTime: 30,
      isActive: true,
    },
  });
  console.log('✅ Produto "Filé com Fritas" criado');

  // 9. Criar itens de estoque (revenda)
  const stockItems = [
    { name: 'Cerveja Brahma 350ml lata', category: 'Bebidas', unit: 'un', currentQuantity: 100, minimumQuantity: 20, costPrice: 3.50, salePrice: 8.00 },
    { name: 'Refrigerante Coca-Cola 350ml lata', category: 'Bebidas', unit: 'un', currentQuantity: 80, minimumQuantity: 15, costPrice: 2.80, salePrice: 6.00 },
    { name: 'Água Mineral 500ml', category: 'Bebidas', unit: 'un', currentQuantity: 120, minimumQuantity: 30, costPrice: 1.20, salePrice: 3.50 },
    { name: 'Suco Natural Laranja 300ml', category: 'Bebidas', unit: 'un', currentQuantity: 40, minimumQuantity: 10, costPrice: 3.00, salePrice: 7.00 },
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

  // 10. Criar mesas
  const tables = [
    { number: 1, capacity: 2 },
    { number: 2, capacity: 4 },
    { number: 3, capacity: 4 },
    { number: 4, capacity: 6 },
    { number: 5, capacity: 2 },
    { number: 6, capacity: 8 },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { number: table.number },
      update: {},
      create: table,
    });
  }
  console.log('✅ Mesas criadas');

  // 11. Criar caixa
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
