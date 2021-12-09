const env = {
  DEBUG: 'express:router:route,mediasoup-wrapper:*'
};
const loadbalancer = () => ({
  name: 'loadbalancer',
  script: './src/entrypoints/loadbalancer.ts',
  interpreter: './node_modules/.bin/ts-node',
  env
});
const router = (num) => ({
  name: 'router-' + num,
  script: './src/entrypoints/router.ts',
  interpreter: './node_modules/.bin/ts-node',
  env
});
const worker = (num) => ({
  name: 'worker-' + num,
  script: './src/entrypoints/worker.ts',
  interpreter: './node_modules/.bin/ts-node',
  env
});
module.exports = {
  apps: [loadbalancer(), router(1), router(2), worker(1), worker(2), worker(3), worker(4)]
};
