import { RedisClient } from './types';
import { v4 as uuidv4 } from 'uuid';

export const createRoom = async (
  redisClient: RedisClient,
  namespace: string,
  roomAttributes: { [k: string]: string },
  thisWorkerId: string
) => {
  const roomId = uuidv4();
  await redisClient.set(`${namespace}:room:${roomId}:worker`, thisWorkerId);
  if (Object.keys(roomAttributes).length > 0) {
    await redisClient.hSet(`${namespace}:room:${roomId}:roomAttributes`, roomAttributes);
  }
  console.log('setting room ' + roomId + ' workerId ' + thisWorkerId);
  return roomId;
};
