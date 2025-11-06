const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

// Credenciais de teste
const credentials = {
  email: 'admin@restaurant.com',
  password: 'admin123'
};

async function testRecipesAPI() {
  try {
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, credentials);
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    console.log('\n📋 Testando GET /recipes...');
    const recipesResponse = await axios.get(`${API_URL}/recipes`, config);
    console.log('✅ Receitas carregadas:', recipesResponse.data);
    
    console.log('\n✅ Todos os testes passaram!');
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('\n💡 Erro 500 - Verifique:');
      console.error('1. Se o Prisma Client foi gerado: npx prisma generate');
      console.error('2. Se as migrations foram aplicadas: npx prisma db push');
      console.error('3. Se o backend está rodando: npm run dev');
    }
  }
}

testRecipesAPI();
