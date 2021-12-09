import test from 'ava';
import { deleteNamespace } from './deleteNamespace';
import { pingWorker } from './pingWorker';
import { startClient } from './startClient';

test('workeripc', async (t) => {
  const ns = 'workeripc';
  const worker1 = await startClient(ns, { type: 'worker' });
  const worker2 = await startClient(ns, { type: 'worker' });

  const response1 = await pingWorker(worker1.redisConnection, worker2.clientId);
  t.is(response1, 'pong');

  const response2 = await pingWorker(worker2.redisConnection, worker1.clientId);
  t.is(response2, 'pong');

  await deleteNamespace(worker1.redisClient, ns);
  await worker1.close();
  await worker2.close();
});
