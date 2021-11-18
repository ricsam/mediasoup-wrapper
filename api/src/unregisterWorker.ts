import { RedisClient } from './types';

export const unregisterWorker = async (client: RedisClient, namespace: string, workerId: string) => {
  await client.lRem(`${namespace}:workers`, 1, workerId);
};
