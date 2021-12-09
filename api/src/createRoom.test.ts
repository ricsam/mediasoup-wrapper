import test, { after } from 'ava';
import { startClient } from './startClient';
import { getRoom } from './getRoom';
import { request } from './request';
import { deleteNamespace } from './deleteNamespace';

test('createRoomRouting', async (t) => {
  const ns = 'createRoomRouting';

  const router = await startClient(ns, { type: 'router' });
  const worker = await startClient(ns, { type: 'worker' });

  /* both with request and direct call to api */
  const roomId1 = await request(router.address, '/router/createRoom');
  const roomId2 = await router.api.createRoom();

  t.is(await getRoom(router.redisClient, ns, roomId1).getWorkerId(), worker.clientId);
  t.is(await getRoom(router.redisClient, ns, roomId2).getWorkerId(), worker.clientId);

  await deleteNamespace(router.redisClient, ns);
  await router.close();
  await worker.close();
});

test('createRoom', async (t) => {
  const ns = 'createRoom';

  const worker1 = await startClient(ns, { type: 'worker' });
  const worker2 = await startClient(ns, { type: 'worker' });

  /* both with request and direct call to api */
  const roomId1 = await worker1.api.createRoom();
  const roomId2 = await worker1.api.createRoom();

  t.is(await getRoom(worker1.redisClient, ns, roomId1).getWorkerId(), worker2.clientId);
  t.is(await getRoom(worker1.redisClient, ns, roomId2).getWorkerId(), worker1.clientId);

  await deleteNamespace(worker1.redisClient, ns);
  await worker1.close();
  await worker2.close();
});
