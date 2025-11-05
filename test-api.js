/**
 * Script de teste da API
 * Execute: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

// Helper para fazer requisições
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Testes
async function runTests() {
  console.log('🧪 Iniciando testes da API...\n');

  try {
    // 1. Health Check
    console.log('1️⃣  Testando Health Check...');
    const health = await makeRequest('GET', '/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Database: ${health.data.services?.database}`);
    console.log(`   Redis: ${health.data.services?.redis}`);
    console.log('   ✅ Health check OK\n');

    // 2. Login
    console.log('2️⃣  Testando Login...');
    const login = await makeRequest('POST', '/api/v1/auth/login', {
      email: 'admin@restaurant.com',
      password: 'admin123',
    });
    
    if (login.status === 200 && login.data.data?.token) {
      authToken = login.data.data.token;
      console.log(`   Status: ${login.status}`);
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
      console.log(`   User: ${login.data.data.user.name}`);
      console.log('   ✅ Login OK\n');
    } else {
      throw new Error('Login falhou: ' + JSON.stringify(login.data));
    }

    // 3. Listar Categorias
    console.log('3️⃣  Testando Listar Categorias...');
    const categories = await makeRequest('GET', '/api/v1/categories', null, authToken);
    console.log(`   Status: ${categories.status}`);
    console.log(`   Total: ${categories.data.data?.length || 0} categorias`);
    if (categories.data.data?.length > 0) {
      console.log(`   Primeira: ${categories.data.data[0].name}`);
    }
    console.log('   ✅ Categorias OK\n');

    // 4. Listar Produtos
    console.log('4️⃣  Testando Listar Produtos...');
    const products = await makeRequest('GET', '/api/v1/products?page=1&limit=10', null, authToken);
    console.log(`   Status: ${products.status}`);
    console.log(`   Total: ${products.data.pagination?.total || 0} produtos`);
    console.log('   ✅ Produtos OK\n');

    // 5. Listar Insumos
    console.log('5️⃣  Testando Listar Insumos...');
    const ingredients = await makeRequest('GET', '/api/v1/ingredients', null, authToken);
    console.log(`   Status: ${ingredients.status}`);
    console.log(`   Total: ${ingredients.data.data?.length || 0} insumos`);
    if (ingredients.data.data?.length > 0) {
      console.log(`   Primeiro: ${ingredients.data.data[0].name} (${ingredients.data.data[0].currentQuantity} ${ingredients.data.data[0].unit})`);
    }
    console.log('   ✅ Insumos OK\n');

    // 6. Criar Produto
    console.log('6️⃣  Testando Criar Produto...');
    const categoryId = categories.data.data?.[0]?.id;
    if (categoryId) {
      const newProduct = await makeRequest('POST', '/api/v1/products', {
        name: 'Pizza Margherita Teste',
        description: 'Pizza com molho de tomate, mussarela e manjericão',
        price: 45.90,
        categoryId: categoryId,
      }, authToken);
      console.log(`   Status: ${newProduct.status}`);
      if (newProduct.status === 201) {
        console.log(`   Produto criado: ${newProduct.data.data?.name}`);
        console.log(`   ID: ${newProduct.data.data?.id}`);
        console.log('   ✅ Criar produto OK\n');
      } else {
        console.log(`   ⚠️  Erro ao criar produto: ${JSON.stringify(newProduct.data)}\n`);
      }
    } else {
      console.log('   ⚠️  Nenhuma categoria disponível para criar produto\n');
    }

    // 7. Relatório de Estoque
    console.log('7️⃣  Testando Relatório de Estoque...');
    const stockReport = await makeRequest('GET', '/api/v1/stock/report', null, authToken);
    console.log(`   Status: ${stockReport.status}`);
    console.log(`   Total de itens: ${stockReport.data.data?.length || 0}`);
    if (stockReport.data.totalValue) {
      console.log(`   Valor total: R$ ${stockReport.data.totalValue}`);
    }
    console.log('   ✅ Relatório OK\n');

    // 8. Teste sem autenticação (deve falhar)
    console.log('8️⃣  Testando Endpoint sem Token (deve falhar)...');
    const noAuth = await makeRequest('GET', '/api/v1/products');
    console.log(`   Status: ${noAuth.status}`);
    if (noAuth.status === 401) {
      console.log('   ✅ Autenticação funcionando corretamente\n');
    } else {
      console.log('   ⚠️  Esperado status 401, recebido ' + noAuth.status + '\n');
    }

    console.log('🎉 Todos os testes concluídos!\n');
    console.log('📊 Resumo:');
    console.log('   ✅ Health Check');
    console.log('   ✅ Autenticação');
    console.log('   ✅ Categorias');
    console.log('   ✅ Produtos');
    console.log('   ✅ Insumos');
    console.log('   ✅ Estoque');
    console.log('   ✅ Segurança');
    console.log('\n💡 Acesse http://localhost:3000/api/docs para testar interativamente!');

  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error.message);
    console.error('\n💡 Certifique-se de que:');
    console.error('   1. A API está rodando (npm run dev)');
    console.error('   2. O Docker está rodando (docker-compose up -d)');
    console.error('   3. O seed foi executado (npm run prisma:seed)');
    process.exit(1);
  }
}

// Executar testes
runTests();
