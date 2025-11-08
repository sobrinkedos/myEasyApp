/**
 * Script de teste para validar o pagamento de comandas
 * 
 * Este script testa o fluxo completo:
 * 1. Abrir sessão de caixa
 * 2. Criar e fechar uma comanda
 * 3. Confirmar pagamento
 * 4. Verificar lançamento no caixa
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function testCommandPayment() {
  console.log('🧪 Iniciando teste de pagamento de comanda...\n');

  try {
    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'admin@example.com',
      password: 'Admin@123',
    });
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Obter caixa ativo ou abrir um novo
    console.log('2️⃣ Verificando sessão de caixa...');
    let sessionId;
    try {
      const activeSessionResponse = await makeRequest('/cash/sessions/active', 'GET', null, token);
      sessionId = activeSessionResponse.data.id;
      console.log(`✅ Sessão de caixa ativa encontrada: ${sessionId}\n`);
    } catch (error) {
      console.log('ℹ️ Nenhuma sessão ativa, abrindo nova sessão...');
      
      // Obter lista de caixas
      const registersResponse = await makeRequest('/cash/registers', 'GET', null, token);
      const cashRegisterId = registersResponse.data[0]?.id;
      
      if (!cashRegisterId) {
        throw new Error('Nenhum caixa disponível');
      }

      const openSessionResponse = await makeRequest('/cash/sessions', 'POST', {
        cashRegisterId,
        openingAmount: 100.00,
      }, token);
      sessionId = openSessionResponse.data.id;
      console.log(`✅ Nova sessão de caixa aberta: ${sessionId}\n`);
    }

    // 3. Criar comanda
    console.log('3️⃣ Criando comanda...');
    const commandResponse = await makeRequest('/commands', 'POST', {
      numberOfPeople: 2,
      type: 'counter',
      customerName: 'Cliente Teste',
    }, token);
    const commandId = commandResponse.data.id;
    const commandCode = commandResponse.data.code;
    console.log(`✅ Comanda criada: ${commandCode} (${commandId})\n`);

    // 4. Adicionar pedido (simulado - você pode adicionar produtos reais)
    console.log('4️⃣ Simulando adição de pedidos...');
    console.log('ℹ️ (Pule esta etapa se quiser testar com pedidos reais)\n');

    // 5. Fechar comanda
    console.log('5️⃣ Fechando comanda...');
    const closeResponse = await makeRequest(`/commands/${commandId}/close`, 'POST', {
      serviceChargePercentage: 10,
    }, token);
    console.log(`✅ Comanda fechada. Total: R$ ${closeResponse.data.total}\n`);

    // 6. Confirmar pagamento
    console.log('6️⃣ Confirmando pagamento...');
    const paymentAmount = Number(closeResponse.data.total);
    const paymentResponse = await makeRequest(`/commands/${commandId}/confirm-payment`, 'POST', {
      paymentMethod: 'CASH',
      amount: paymentAmount,
    }, token);
    console.log(`✅ Pagamento confirmado: R$ ${paymentAmount}\n`);

    // 7. Verificar transações do caixa
    console.log('7️⃣ Verificando lançamentos no caixa...');
    const transactionsResponse = await makeRequest(`/cash/sessions/${sessionId}/transactions`, 'GET', null, token);
    
    const saleTransaction = transactionsResponse.data.find(
      t => t.type === 'SALE' && t.saleId === commandId
    );

    if (saleTransaction) {
      console.log('✅ Transação encontrada no caixa:');
      console.log(`   - Tipo: ${saleTransaction.type}`);
      console.log(`   - Valor: R$ ${saleTransaction.amount}`);
      console.log(`   - Forma de pagamento: ${saleTransaction.paymentMethod}`);
      console.log(`   - Referência (comanda): ${saleTransaction.saleId}`);
      console.log(`   - Data/Hora: ${saleTransaction.timestamp}\n`);
    } else {
      throw new Error('❌ Transação não encontrada no caixa!');
    }

    // 8. Verificar saldo do caixa
    console.log('8️⃣ Verificando saldo do caixa...');
    const balanceResponse = await makeRequest(`/cash/sessions/${sessionId}/balance`, 'GET', null, token);
    console.log('✅ Saldo do caixa:');
    console.log(`   - Abertura: R$ ${balanceResponse.data.openingAmount}`);
    console.log(`   - Vendas: R$ ${balanceResponse.data.salesTotal}`);
    console.log(`   - Vendas em dinheiro: R$ ${balanceResponse.data.cashSales}`);
    console.log(`   - Saldo esperado: R$ ${balanceResponse.data.expectedCash}`);
    console.log(`   - Saldo atual: R$ ${balanceResponse.data.currentBalance}\n`);

    console.log('✅ ✅ ✅ TESTE CONCLUÍDO COM SUCESSO! ✅ ✅ ✅');
    console.log('\n📊 Resumo:');
    console.log(`   - Comanda: ${commandCode}`);
    console.log(`   - Valor pago: R$ ${paymentAmount}`);
    console.log(`   - Lançado no caixa: SIM ✅`);
    console.log(`   - Sessão de caixa: ${sessionId}`);

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    console.error(error.message);
    process.exit(1);
  }
}

// Executar teste
testCommandPayment();
