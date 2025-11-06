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

async function addProductWithImage() {
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
    
    const token = loginRes.data.data?.token || loginRes.data.token;
    console.log('✅ Login OK!');
    
    // Get categories
    console.log('\n📋 Buscando categorias...');
    const categoriesRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/categories',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const categories = categoriesRes.data.data || categoriesRes.data;
    const category = categories[0];
    
    if (!category) {
      console.log('❌ Nenhuma categoria encontrada');
      return;
    }
    
    console.log(`✅ Usando categoria: ${category.name}`);
    
    // Create product with image
    console.log('\n🍕 Criando produto com imagem...');
    const productRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/products',
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Pizza Margherita',
      description: 'Pizza clássica com molho de tomate, mussarela e manjericão',
      price: 45.90,
      categoryId: category.id,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      preparationTime: 25
    });
    
    console.log('Status:', productRes.status);
    console.log('Response:', JSON.stringify(productRes.data, null, 2));
    
    if (productRes.status === 201) {
      console.log('\n✅ Produto criado com sucesso!');
      console.log('🖼️ Imagem: https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400');
    } else {
      console.log('\n❌ Erro ao criar produto');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

addProductWithImage();
