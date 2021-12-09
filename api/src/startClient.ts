import express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import { createClient } from 'redis';
import { RedisApi } from './api';
import { getWorkerAddress } from './getWorkerAddress';
import { registerClient } from './registerClient';
import { request } from './request';
import { RedisClient, RedisConnection, ClientType } from './types';
import { unregisterClient } from './unregisterClient';
// rest of the code remains same

type Express = typeof express extends () => infer U ? U : never;

class WorkerApi {
  public redisApi: RedisApi;

  constructor(public redis: RedisConnection, public thisClientId: string) {
    this.redisApi = new RedisApi(redis, thisClientId);
  }
  async createRoom() {
    const type = 'worker' as const;
    const nextClientId = (await this.redis.client.eval(`
      local nextIndex = redis.call('incr', '${this.redis.ns}:worker:round-robin') % redis.call('llen', '${this.redis.ns}:${type}:clients')
      return redis.call('lindex', '${this.redis.ns}:${type}:clients', nextIndex)
    `)) as string | null;

    if (nextClientId === null) {
      throw new Error('No workers count be found');
    }

    if (nextClientId === this.thisClientId) {
      return await this.redisApi.createRoom({});
    }
    const address = await getWorkerAddress(this.redis, 'worker', nextClientId);

    const response = await request(address, '/worker/createRoom');
    return response;
  }
}

const setWorkerInterComPaths = (app: Express, api: RedisApi) => {
  app.get('/', (req, res) => res.send('Express + TypeScript Server'));
  app.get('/ping', (req, res) => res.send('pong'));
  app.get('/worker/createRoom', async (req, res) => {
    res.send(await api.createRoom({}));
  });
};
const setRouterPaths = (app: Express, api: WorkerApi) => {
  app.get('/router/createRoom', async (req, res) => {
    res.send(await api.createRoom());
  });
};

export const startClient = (
  namespace: string,
  props: { type: ClientType } | { type: 'loadbalancer'; port: number; clientId: string }
) => {
  return new Promise<{
    close: () => Promise<unknown>;
    redisClient: RedisClient;
    redisConnection: RedisConnection;
    address: string;
    server: http.Server;
    clientId: string;
    api: WorkerApi;
  }>((resolve, reject) => {
    const app = express();

    const server = app.listen(props.type === 'loadbalancer' ? props.port : 0, async () => {
      const address = server.address();

      if (typeof address !== 'string' && address) {
        const fulladdress = 'http://' + address.address.replace(/::/, 'localhost') + ':' + address.port;
        const client = createClient();
        client.on('error', (err) => console.log('Redis Client Error', err));
        await client.connect();

        const type = props.type;

        const redisConnection: RedisConnection = { client: client as any, ns: namespace };
        const clientId =
          props.type === 'loadbalancer'
            ? props.clientId
            : await registerClient(redisConnection, props.type, fulladdress);

        const redisApi = new RedisApi(redisConnection, clientId);
        if (type === 'worker') {
          setWorkerInterComPaths(app, redisApi);
        }

        const workerApi = new WorkerApi(redisConnection, clientId);
        if (type === 'router') {
          setRouterPaths(app, workerApi);
        }

        if (type === 'loadbalancer') {
          setRouterPaths(app, workerApi);
        }

        console.log(`⚡️[server]: Server@${type} is running at ${fulladdress}`);
        resolve({
          address: fulladdress,
          server,
          clientId,
          redisClient: client as any,
          redisConnection,
          close: async () => {
            if (props.type !== 'loadbalancer') {
              await unregisterClient(redisConnection, props.type, clientId);
            }
            client.disconnect();
            server.close();
          },
          api: workerApi
        });
      } else {
        server.close();
        reject(new Error('invalid address from express'));
      }
    });
  });
};
