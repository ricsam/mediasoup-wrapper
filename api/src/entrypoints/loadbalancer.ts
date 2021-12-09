import { startClient } from '../startClient';

console.log('starting loadbalancer on port 8080');
startClient('localhost', { type: 'loadbalancer', port: 8080, clientId: 'loadbalancer@localhost' }).then(
  () => {}
);
