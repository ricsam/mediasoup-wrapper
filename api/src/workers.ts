import { observer } from 'mediasoup';
import { Router } from 'mediasoup/node/lib/Router';
import { Worker } from 'mediasoup/node/lib/Worker';
import { startMediasoup } from './startMediasoup';

let workers:
  | {
      worker: Worker;
      router: Router;
    }[]
  | undefined;

let workerIdx = 0;

export const getNextWorker = async () => {
  if (!workers) {
    try {
      workers = await startMediasoup();
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  const w = workers[workerIdx];
  workerIdx++;
  workerIdx %= workers.length;
  return w;
};
export const closeAllWorkersAndRouters = () => {
  workers?.forEach((worker) => {
    worker.worker.removeAllListeners();
    worker.router.removeAllListeners();
    worker.worker.close();
    worker.router.close();
  });
  observer.emit('close');
};
