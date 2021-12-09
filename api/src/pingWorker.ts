import { getWorkerAddress } from './getWorkerAddress';
import { request } from './request';
import { RedisClient, RedisConnection } from './types';

export const pingWorker = async (redis: RedisConnection, workerId: string) => {
  const address = await getWorkerAddress(redis, 'worker', workerId);
  const response = await request(address, '/ping');
  return response;
};
