import { RedisClient } from "./types";

export const getWorkerAddress = async (client: RedisClient, namespace: string, workerId: string) => {
  const address = await client.get(`${namespace}:worker:${workerId}:address`);
  if (!address) {
    throw new Error('invalid address');
  }
  return address;
};
