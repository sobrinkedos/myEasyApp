import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCashSession() {
  try {
    console.log('🔍 Testing cash session creation...');

    // 1. Get first user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error('❌ No user found');
      return;
    }
    console.log('✅ User found:', user.name);

    // 2. Get first cash register
    const cashRegister = await prisma.cashRegister.findFirst();
    if (!cashRegister) {
      console.error('❌ No cash register found');
      return;
    }
    console.log('✅ Cash register found:', cashRegister.name);

    // 3. Check for existing open session
    const existingSession = await prisma.cashSession.findFirst({
      where: {
        operatorId: user.id,
        status: 'OPEN',
      },
    });

    if (existingSession) {
      console.log('⚠️  User already has an open session:', existingSession.id);
      return;
    }

    // 4. Try to create session
    console.log('📝 Creating session...');
    const session = await prisma.cashSession.create({
      data: {
        cashRegisterId: cashRegister.id,
        operatorId: user.id,
        openingAmount: 100,
        status: 'OPEN',
      },
    });
    console.log('✅ Session created:', session.id);

    // 5. Try to create opening transaction
    console.log('📝 Creating opening transaction...');
    const transaction = await prisma.cashTransaction.create({
      data: {
        cashSessionId: session.id,
        type: 'OPENING',
        amount: 100,
        userId: user.id,
        description: 'Abertura de caixa',
      },
    });
    console.log('✅ Transaction created:', transaction.id);

    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCashSession();
