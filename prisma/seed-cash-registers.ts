import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCashRegisters() {
  console.log('🔄 Criando caixas de teste...');

  try {
    // Buscar o primeiro estabelecimento
    const establishment = await prisma.establishment.findFirst();

    if (!establishment) {
      console.error('❌ Nenhum estabelecimento encontrado. Crie um estabelecimento primeiro.');
      return;
    }

    console.log(`✅ Estabelecimento encontrado: ${establishment.name}`);

    // Verificar se já existem caixas
    const existingRegisters = await prisma.cashRegister.findMany({
      where: { establishmentId: establishment.id },
    });

    if (existingRegisters.length > 0) {
      console.log(`ℹ️  Já existem ${existingRegisters.length} caixas cadastrados`);
      existingRegisters.forEach((register) => {
        console.log(`   - ${register.name} (Número: ${register.number})`);
      });
      return;
    }

    // Criar caixas de teste
    const registers = [
      { number: 1, name: 'Caixa 1 - Principal' },
      { number: 2, name: 'Caixa 2 - Secundário' },
      { number: 3, name: 'Caixa 3 - Delivery' },
    ];

    for (const register of registers) {
      await prisma.cashRegister.create({
        data: {
          ...register,
          establishmentId: establishment.id,
          isActive: true,
        },
      });
      console.log(`✅ Criado: ${register.name}`);
    }

    console.log('✅ Caixas criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar caixas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCashRegisters();
