import { RedisClient } from './types';

export const deleteNamespace = async (client: RedisClient, namespace: string) => {
  for await (const key of client.scanIterator({
    MATCH: namespace + ':*',
    COUNT: 100
  })) {
    await client.del(key);
  }
};
