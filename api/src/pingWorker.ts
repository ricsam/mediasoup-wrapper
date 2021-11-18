import { getWorkerAddress } from './getWorkerAddress';
import { request } from './request';
import { RedisClient } from './types';

export const pingWorker = async (client: RedisClient, namespace: string, workerId: string) => {
  const address = await getWorkerAddress(client, namespace, workerId);
  const response = await request(address, '/ping');
  return response;
};
