import { createClient } from 'redis';

export type RedisClient = typeof createClient extends () => infer U ? U : never;
