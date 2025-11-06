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

async function checkProducts() {
  try {
    // Login
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
    
    const token = loginRes.data.data?.token || loginRes.data.token;
    
    // Get products
    const productsRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/products',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Produtos:', JSON.stringify(productsRes.data, null, 2));
    
    if (productsRes.data.data && productsRes.data.data.length > 0) {
      console.log('\n📊 Resumo:');
      console.log(`Total de produtos: ${productsRes.data.data.length}`);
      productsRes.data.data.forEach(p => {
        console.log(`\n- ${p.name}`);
        console.log(`  Imagem: ${p.imageUrl || 'SEM IMAGEM'}`);
        console.log(`  Preço: R$ ${p.price}`);
      });
    } else {
      console.log('\n⚠️ Nenhum produto cadastrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkProducts();
