// Script para criar usuário de teste
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Criando usuário de teste...\n');

    // Verificar se já existe establishment
    let establishment = await prisma.establishment.findFirst();
    
    if (!establishment) {
      console.log('📍 Criando estabelecimento...');
      establishment = await prisma.establishment.create({
        data: {
          name: 'Restaurante Teste',
          cnpj: '12345678901234',
          address: {
            street: 'Rua Teste',
            number: '123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567'
          },
          phone: '(11) 1234-5678',
          email: 'contato@restaurante.com',
          taxSettings: {}
        }
      });
      console.log('✅ Estabelecimento criado!\n');
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@restaurant.com' }
    });

    if (existingUser) {
      console.log('⚠️  Usuário admin@restaurant.com já existe!');
      console.log('\n📧 Credenciais:');
      console.log('Email: admin@restaurant.com');
      console.log('Senha: admin123\n');
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Criar usuário
    console.log('👤 Criando usuário admin...');
    const user = await prisma.user.create({
      data: {
        email: 'admin@restaurant.com',
        password: hashedPassword,
        name: 'Administrador',
        phone: '(11) 98765-4321',
        establishmentId: establishment.id,
        isActive: true,
        emailVerified: true,
      }
    });

    console.log('✅ Usuário criado com sucesso!\n');
    console.log('📧 Credenciais de Login:');
    console.log('━'.repeat(40));
    console.log('Email:    admin@restaurant.com');
    console.log('Senha:    admin123');
    console.log('━'.repeat(40));
    console.log('\n🌐 Acesse: http://localhost:5173/auth/login\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
