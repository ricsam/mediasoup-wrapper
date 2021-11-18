import { RedisClient } from './types';

export const deleteNamespace = async (client: RedisClient, namespace: string) => {
  for await (const key of client.scanIterator({
    TYPE: 'string', // `SCAN` only
    MATCH: namespace + ':*',
    COUNT: 100
  })) {
    // use the key!
    await client.del(key);
  }
};
