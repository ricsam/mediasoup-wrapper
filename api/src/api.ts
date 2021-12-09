import { RedisClient, RedisConnection } from './types';
import { v4 as uuidv4 } from 'uuid';

export class RedisApi {
  constructor(public redis: RedisConnection, public thisWorkerId: string) {}
  async createRoom(roomAttributes: { [k: string]: string }) {
    const roomId = uuidv4();
    await this.redis.client.set(`${this.redis.ns}:room:${roomId}:worker`, this.thisWorkerId);
    if (Object.keys(roomAttributes).length > 0) {
      await this.redis.client.hSet(`${this.redis.ns}:room:${roomId}:roomAttributes`, roomAttributes);
    }
    console.log('setting room ' + roomId + ' workerId ' + this.thisWorkerId);
    return roomId;
  }
}
