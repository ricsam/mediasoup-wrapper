import { RedisClient, RedisConnection } from './types';

export const unregisterClient = async (
  { client, ns }: RedisConnection,
  type: 'worker' | 'router',
  clientId: string
) => {
  await client.lRem(`${ns}:${type}:clients`, 1, clientId);
};
