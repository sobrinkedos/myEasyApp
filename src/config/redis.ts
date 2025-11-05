import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Configuração para Upstash (com TLS)
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    // Limitar tentativas de reconexão
    if (times > 3) {
      console.log('⚠️  Redis: Máximo de tentativas atingido, continuando sem cache');
      return null; // Para de tentar reconectar
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Habilitar TLS se a URL começar com rediss://
  tls: redisUrl.startsWith('rediss://') ? {
    rejectUnauthorized: false, // Necessário para alguns provedores
  } : undefined,
  // Configurações adicionais para Upstash
  family: 0, // Usar IPv4 e IPv6
  enableReadyCheck: false,
  lazyConnect: false,
  connectTimeout: 10000, // 10 segundos
  keepAlive: 30000,
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  // Apenas logar, não encerrar o processo
  if (err.code !== 'ECONNREFUSED') {
    console.error('⚠️  Redis error:', err.message);
  }
});

redis.on('ready', () => {
  console.log('✅ Redis ready');
});

// Não encerrar o processo se Redis falhar
redis.on('close', () => {
  console.log('⚠️  Redis connection closed, API continuará sem cache');
});

export default redis;
