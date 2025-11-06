const jwt = require('jsonwebtoken');

// Cole aqui o token do localStorage
const token = process.argv[2];

if (!token) {
  console.log('❌ Uso: node verificar-token.js SEU_TOKEN_AQUI');
  process.exit(1);
}

try {
  const decoded = jwt.decode(token);
  console.log('🔍 Token decodificado:');
  console.log(JSON.stringify(decoded, null, 2));
  console.log('\n📋 Informações:');
  console.log('- User ID:', decoded.userId);
  console.log('- Email:', decoded.email);
  console.log('- Establishment ID:', decoded.establishmentId);
  console.log('- Roles:', decoded.roles);
} catch (error) {
  console.error('❌ Erro ao decodificar token:', error.message);
}
