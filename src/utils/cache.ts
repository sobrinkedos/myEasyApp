import redis from '@/config/redis';

export class CacheService {
  private isRedisAvailable = true;

  async get<T>(key: string): Promise<T | null> {
    if (!this.isRedisAvailable) return null;
    
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.isRedisAvailable = false;
      console.warn('⚠️  Cache get error, continuando sem cache');
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    if (!this.isRedisAvailable) return;
    
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      this.isRedisAvailable = false;
      console.warn('⚠️  Cache set error, continuando sem cache');
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isRedisAvailable) return;
    
    try {
      await redis.del(key);
    } catch (error) {
      this.isRedisAvailable = false;
      console.warn('⚠️  Cache delete error, continuando sem cache');
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isRedisAvailable) return;
    
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      this.isRedisAvailable = false;
      console.warn('⚠️  Cache delete pattern error, continuando sem cache');
    }
  }
}

export const cacheService = new CacheService();
