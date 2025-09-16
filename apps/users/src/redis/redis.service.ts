import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('ready', () => {
      console.log('Redis is ready to accept commands');
    });
  }
  onModuleDestroy() {
    if (this.redis) {
      this.redis.disconnect();
    }
  }
  setKey(key: string, value: string | number): string {
    return `${key}:${value}`;
  }
  // Basic Redis operations
  async set(first: string, key: string, value: string | number, ttl?: number): Promise<void> {
    const keySet = this.setKey(first, key);
    if (ttl) {
      await this.redis.setex(keySet, ttl, value);
    } else {
      await this.redis.set(keySet, value);
    }
  }
  async setPriceSOL(key: string, value: number): Promise<void> {
    await this.redis.set(key, value);
  }
  async getPriceSOL(key: string): Promise<number | null> {
    const value = await this.redis.get(key);
    return value ? parseFloat(value) : null;
  }
  async get(first: string, key: string): Promise<string | null> {
    const keySet = this.setKey(first, key);
    return this.redis.get(keySet);
  }

  async del(first: string, key: string): Promise<number> {
    const keySet = this.setKey(first, key);
    return this.redis.del(keySet);
  }

  async ttl(first: string, key: string): Promise<number> {
    const keySet = this.setKey(first, key);
    return this.redis.ttl(keySet);
  }

  // JSON operations
  async setJson(first: string, key: string, value: any, ttl?: number): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.set(first, key, jsonValue, ttl);
  }

  async getJson<T>(first: string, key: string): Promise<T | null> {
    const value = await this.get(first, key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
}
