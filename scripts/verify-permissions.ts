import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando permissões do usuário admin...\n');

  // Buscar usuário
  const user = await prisma.user.findFirst({
    where: { email: 'admin@saborarte.com.br' },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.log('❌ Usuário não encontrado!');
    return;
  }

  console.log(`✅ Usuário: ${user.name} (${user.email})`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Ativo: ${user.isActive}`);
  console.log(`   Email Verificado: ${user.emailVerified}\n`);

  console.log('👑 Roles:');
  for (const userRole of user.roles) {
    console.log(`   - ${userRole.role.name}: ${userRole.role.description}`);
    console.log(`     Permissões: ${userRole.role.permissions.length}`);
  }

  console.log('\n🔐 Permissões detalhadas:');
  const allPermissions = user.roles.flatMap(ur => 
    ur.role.permissions.map(rp => rp.permission)
  );

  // Agrupar por recurso
  const groupedPermissions: Record<string, string[]> = {};
  for (const perm of allPermissions) {
    if (!groupedPermissions[perm.resource]) {
      groupedPermissions[perm.resource] = [];
    }
    groupedPermissions[perm.resource].push(perm.action);
  }

  for (const [resource, actions] of Object.entries(groupedPermissions)) {
    console.log(`   ${resource}:`);
    for (const action of actions) {
      console.log(`      - ${action}`);
    }
  }

  console.log(`\n📊 Total de permissões: ${allPermissions.length}`);
  console.log(`📊 Total de recursos: ${Object.keys(groupedPermissions).length}`);

  // Verificar permissões críticas
  console.log('\n✅ Verificando permissões críticas:');
  const criticalPermissions = [
    'stock-items:delete',
    'stock-items:create',
    'stock-items:update',
    'products:delete',
    'users:manage',
  ];

  for (const permStr of criticalPermissions) {
    const [resource, action] = permStr.split(':');
    const hasPerm = allPermissions.some(
      p => p.resource === resource && p.action === action
    );
    console.log(`   ${hasPerm ? '✅' : '❌'} ${permStr}`);
  }

  console.log('\n🎉 Verificação concluída!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
