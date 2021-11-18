import express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import { createClient } from 'redis';
import { createRoom } from './api';
import { getWorkerAddress } from './getWorkerAddress';
import { registerWorker } from './registerWorker';
import { request } from './request';
import { RedisClient } from './types';
import { unregisterWorker } from './unregisterWorker';
// rest of the code remains same

type Express = typeof express extends () => infer U ? U : never;

const setAppPaths = (app: Express, redisClient: RedisClient, namespace: string, thisWorkerId: string) => {
  app.get('/', (req, res) => res.send('Express + TypeScript Server'));
  app.get('/ping', (req, res) => res.send('pong'));
  app.get('/router/createRoom', async (req, res) => {
    const nextWorkerId = (await redisClient.eval(`
      local nextIndex = redis.call('incr', '${namespace}:worker:round-robin') % redis.call('llen', '${namespace}:workers')
      return redis.call('lindex', '${namespace}:workers', nextIndex)
    `)) as string;
    console.log('@nextWorkerId', nextWorkerId, 'thisworker', thisWorkerId);
    if (nextWorkerId === thisWorkerId) {
      res.send(await createRoom(redisClient, namespace, {}, thisWorkerId));
      return;
    }
    const address = await getWorkerAddress(redisClient, namespace, nextWorkerId);
    const response = await request(address, '/worker/createRoom');
    console.log('@reponse', response);
    res.send(response);
  });
  app.get('/worker/createRoom', async (req, res) => {
    console.log('getting incoming request on worker', thisWorkerId);
    res.send(await createRoom(redisClient, namespace, {}, thisWorkerId));
  });
};

export const startWorker = (namespace: string) => {
  return new Promise<{
    close: () => Promise<unknown>;
    redisClient: RedisClient;
    address: string;
    server: http.Server;
    workerId: string;
  }>((resolve, reject) => {
    const app = express();

    const server = app.listen(0, async () => {
      const address = server.address();
      if (typeof address !== 'string' && address) {
        const fulladdress = 'http://' + address.address.replace(/::/, 'localhost') + ':' + address.port;
        const client = createClient();
        client.on('error', (err) => console.log('Redis Client Error', err));
        await client.connect();

        const workerId = await registerWorker(client as any, namespace, fulladdress);
        setAppPaths(app, client as any, namespace, workerId);

        console.log(`⚡️[server]: Server is running at ${fulladdress}`);
        resolve({
          address: fulladdress,
          server,
          workerId,
          redisClient: client as any,
          close: async () => {
            await unregisterWorker(client as any, namespace, workerId);
            client.disconnect();
            server.close();
          }
        });
      } else {
        server.close();
        reject(new Error('invalid address from express'));
      }
    });
  });
};
