import { createClient } from 'redis';

export type RedisClient = typeof createClient extends () => infer U ? U : never;

export type RedisConnection = {
  client: RedisClient;
  ns: string;
};

export type ClientType = 'worker' | 'router';
