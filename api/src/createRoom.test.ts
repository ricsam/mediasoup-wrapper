import test, { after } from 'ava';
import { startWorker } from './startWorker';
import { createRoom } from './api';
import { getRoom } from './getRoom';
import { request } from './request';
import { deleteNamespace } from './deleteNamespace';

test('createRoom', async (t) => {
  const ns = 'createRoom';

  const worker1 = await startWorker(ns);
  const worker2 = await startWorker(ns);

  const roomId1 = await request(worker1.address, '/router/createRoom');
  const roomId2 = await request(worker1.address, '/router/createRoom');

  t.is(await getRoom(worker1.redisClient, ns, roomId1).getWorkerId(), worker2.workerId);
  t.is(await getRoom(worker1.redisClient, ns, roomId2).getWorkerId(), worker1.workerId);

  await deleteNamespace(worker1.redisClient, ns);
  await worker1.close();
  await worker2.close();
});
