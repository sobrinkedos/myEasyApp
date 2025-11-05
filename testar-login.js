/**
 * Script para testar login no sistema
 * Execute: node testar-login.js
 */

const http = require('http');

console.log('🔐 Testando Login no Sistema...\n');

const loginData = JSON.stringify({
  email: 'admin@restaurant.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('📊 Resposta do Servidor:\n');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Status Text: ${res.statusCode === 200 ? 'OK' : 'Erro'}\n`);

    try {
      const response = JSON.parse(body);
      
      if (res.statusCode === 200 && response.success) {
        console.log('✅ LOGIN BEM-SUCEDIDO!\n');
        console.log('📋 Dados do Usuário:');
        console.log(`   Nome: ${response.data.user.name}`);
        console.log(`   Email: ${response.data.user.email}`);
        console.log(`   Role: ${response.data.user.role}`);
        console.log(`   ID: ${response.data.user.id}\n`);
        
        console.log('🔑 Token JWT:');
        console.log(`   ${response.data.token.substring(0, 50)}...`);
        console.log(`   Expira em: ${response.data.expiresIn}\n`);
        
        console.log('💡 Como usar o token:');
        console.log('   1. Copie o token completo abaixo');
        console.log('   2. No Swagger, clique em "Authorize"');
        console.log('   3. Cole o token');
        console.log('   4. Teste qualquer endpoint!\n');
        
        console.log('📋 Token Completo (copie):');
        console.log('─'.repeat(80));
        console.log(response.data.token);
        console.log('─'.repeat(80));
        console.log('\n🎉 Você está autenticado! Acesse: http://localhost:3000/api/docs');
        
      } else {
        console.log('❌ FALHA NO LOGIN\n');
        console.log('Resposta:', JSON.stringify(response, null, 2));
        
        if (response.message) {
          console.log(`\nMensagem: ${response.message}`);
        }
        
        console.log('\n💡 Verifique:');
        console.log('   1. A API está rodando? (npm run dev)');
        console.log('   2. O seed foi executado? (npm run prisma:seed)');
        console.log('   3. As credenciais estão corretas?');
        console.log('      Email: admin@restaurant.com');
        console.log('      Senha: admin123');
      }
      
    } catch (error) {
      console.log('❌ Erro ao processar resposta:', error.message);
      console.log('Resposta bruta:', body);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erro na requisição:', error.message);
  console.log('\n💡 Certifique-se de que:');
  console.log('   1. A API está rodando em http://localhost:3000');
  console.log('   2. Execute: npm run dev');
});

req.write(loginData);
req.end();
