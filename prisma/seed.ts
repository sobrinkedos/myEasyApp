import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const categories = [
    { name: 'Entradas', displayOrder: 1 },
    { name: 'Pratos Principais', displayOrder: 2 },
    { name: 'Bebidas', displayOrder: 3 },
    { name: 'Sobremesas', displayOrder: 4 },
    { name: 'Lanches', displayOrder: 5 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log('✅ Categories created');

  // Create sample ingredients
  const ingredients = [
    { name: 'Carne Bovina', unit: 'kg', currentQuantity: 50, minimumQuantity: 10, averageCost: 35 },
    { name: 'Frango', unit: 'kg', currentQuantity: 40, minimumQuantity: 10, averageCost: 18 },
    { name: 'Queijo Mussarela', unit: 'kg', currentQuantity: 20, minimumQuantity: 5, averageCost: 45 },
    { name: 'Tomate', unit: 'kg', currentQuantity: 15, minimumQuantity: 5, averageCost: 8 },
    { name: 'Alface', unit: 'un', currentQuantity: 30, minimumQuantity: 10, averageCost: 3 },
    { name: 'Refrigerante', unit: 'l', currentQuantity: 100, minimumQuantity: 20, averageCost: 5 },
  ];

  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { id: ingredient.name },
      update: {},
      create: ingredient as any,
    });
  }
  console.log('✅ Ingredients created');

  // Create establishment
  await prisma.establishment.upsert({
    where: { cnpj: '12345678000190' },
    update: {},
    create: {
      name: 'Restaurante Exemplo',
      cnpj: '12345678000190',
      address: {
        street: 'Rua Exemplo',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
      phone: '(11) 1234-5678',
      email: 'contato@restaurante.com',
      taxSettings: {
        taxRegime: 'Simples Nacional',
        icmsRate: 0,
        issRate: 2.5,
        pisRate: 0,
        cofinsRate: 0,
      },
    },
  });
  console.log('✅ Establishment created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
