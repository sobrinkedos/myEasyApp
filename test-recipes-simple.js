const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  try {
    console.log('🔐 Fazendo login...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    
    if (loginRes.status !== 200) {
      console.error('❌ Erro no login:', loginRes);
      return;
    }
    
    const token = loginRes.data.data?.token || loginRes.data.token;
    console.log('✅ Login OK!');
    console.log('Token:', token ? 'Recebido' : 'NÃO RECEBIDO');
    console.log('Login response:', JSON.stringify(loginRes.data, null, 2));
    
    console.log('\n📋 Testando GET /recipes...');
    const recipesRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/recipes',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Status:', recipesRes.status);
    console.log('Data:', JSON.stringify(recipesRes.data, null, 2));
    
    if (recipesRes.status === 200) {
      console.log('\n✅ API de receitas funcionando!');
    } else {
      console.log('\n❌ Erro na API de receitas');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Verifique se o backend está rodando: npm run dev');
  }
}

test();
