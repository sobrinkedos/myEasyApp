const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarUsuarios() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...\n');

    const users = await prisma.user.findMany({
      include: {
        establishment: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados.');
      return;
    }

    console.log(`✅ Encontrados ${users.length} usuário(s):\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Estabelecimento: ${user.establishment.name}`);
      console.log(`   CNPJ: ${user.establishment.cnpj}`);
      console.log(`   Roles: ${user.roles.map((r) => r.role.name).join(', ')}`);
      console.log(`   Criado em: ${user.createdAt}`);
      console.log('');
    });

    // Verificar estabelecimentos
    const establishments = await prisma.establishment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    console.log(`\n📊 Total de estabelecimentos: ${establishments.length}`);
    establishments.forEach((est, index) => {
      console.log(`${index + 1}. ${est.name} (CNPJ: ${est.cnpj})`);
    });
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuarios();
