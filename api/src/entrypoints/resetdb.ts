import { deleteNamespace } from '../deleteNamespace';
import { createClient } from 'redis';

(async () => {
  const client = createClient();
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
  console.log('connected');
  await deleteNamespace(client as any, 'localhost');
  console.log('deleting');
  await client.disconnect()
})();
