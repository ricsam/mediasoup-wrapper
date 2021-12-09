import { ClientType, RedisClient, RedisConnection } from './types';

export const setWorkerAddress = async (
  { client, ns }: RedisConnection,
  type: ClientType,
  clientId: string,
  serverAddress: string
) => {
  await client.set(`${ns}:${type}:client:${clientId}:address`, serverAddress);
};

export const getWorkerAddress = async (
  { client, ns }: RedisConnection,
  type: 'worker' | 'router',
  clientId: string
) => {
  const address = await client.get(`${ns}:${type}:client:${clientId}:address`);
  if (!address) {
    throw new Error('invalid address');
  }
  return address;
};
