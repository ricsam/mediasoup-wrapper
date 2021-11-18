import { RedisClient } from './types';

export const registerWorker = async (client: RedisClient, namespace: string, serverAddress: string) => {
  const workerIdInt = await client.incr(`${namespace}:worker-registry:count`);
  const workerId = String(workerIdInt);
  await client.rPush(`${namespace}:workers`, workerId);
  await client.set(`${namespace}:worker:${workerId}:address`, serverAddress);
  return workerId;
};
