const http = require('http');
const fs = require('fs');
const path = require('path');

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
    if (data) req.write(data);
    req.end();
  });
}

async function testUpload() {
  try {
    console.log('🔐 Fazendo login...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({
      email: 'admin@restaurant.com',
      password: 'admin123'
    }));
    
    const token = loginRes.data.data?.token || loginRes.data.token;
    console.log('✅ Login OK!');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    // Create multipart form data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="image"; filename="test.png"',
      'Content-Type: image/png',
      '',
      testImage.toString('binary'),
      `--${boundary}--`
    ].join('\r\n');
    
    console.log('\n📤 Testando upload...');
    const uploadRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/upload/image',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      }
    }, formData);
    
    console.log('Status:', uploadRes.status);
    console.log('Response:', JSON.stringify(uploadRes.data, null, 2));
    
    if (uploadRes.status === 200 && uploadRes.data.success) {
      console.log('\n✅ Upload funcionou!');
      console.log('URL da imagem:', uploadRes.data.data.url);
      
      // Now test creating a product with this image
      console.log('\n🍕 Criando produto com imagem...');
      
      // Get categories first
      const categoriesRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/categories',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const categories = categoriesRes.data.data || categoriesRes.data;
      const category = categories[0];
      
      const productRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/products',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, JSON.stringify({
        name: 'Produto Teste com Imagem',
        description: 'Teste de upload',
        price: 10.00,
        categoryId: category.id,
        imageUrl: uploadRes.data.data.url
      }));
      
      console.log('Produto criado:', JSON.stringify(productRes.data, null, 2));
      
      if (productRes.status === 201) {
        console.log('\n✅ Produto criado com imagem!');
        console.log('ID:', productRes.data.data.id);
        console.log('ImageUrl:', productRes.data.data.imageUrl);
      }
    } else {
      console.log('\n❌ Upload falhou');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testUpload();
