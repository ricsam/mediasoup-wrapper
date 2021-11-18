import test from 'ava';
import { deleteNamespace } from './deleteNamespace';
import { pingWorker } from './pingWorker';
import { startWorker } from './startWorker';

test('workeripc', async (t) => {
  const ns = 'workeripc';
  const worker1 = await startWorker(ns);
  const worker2 = await startWorker(ns);

  const response1 = await pingWorker(worker1.redisClient, ns, worker2.workerId);
  t.is(response1, 'pong');

  const response2 = await pingWorker(worker2.redisClient, ns, worker1.workerId);
  t.is(response2, 'pong');

  await deleteNamespace(worker1.redisClient, ns);
  await worker1.close();
  await worker2.close();
});
