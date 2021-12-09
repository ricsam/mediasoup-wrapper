import { setWorkerAddress } from './getWorkerAddress';
import { ClientType, RedisClient, RedisConnection } from './types';

export const registerClient = async (redis: RedisConnection, type: ClientType, serverAddress: string) => {
  const { client, ns } = redis;
  const clientIdInt = await client.incr(`${ns}:${type}-registry:count`);
  const clientId = String(clientIdInt);
  await client.rPush(`${ns}:${type}:clients`, clientId);
  await setWorkerAddress(redis, type, clientId, serverAddress);
  return clientId;
};
