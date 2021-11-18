import { RedisClient } from './types';

export const getRoom = (redisClient: RedisClient, namespace: string, roomId: string) => {
  return {
    getWorkerId: async () => {
      const workerId = redisClient.get(`${namespace}:room:${roomId}:worker`);
      if (!workerId) {
        throw new Error('invalid roomId');
      }
      return workerId;
    }
  };
};
