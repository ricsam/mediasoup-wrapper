import https from 'https';
import http from 'http';

/**
 *
 * @param address server address e.g. http://localhost:8080
 * @param path path that must start with / e.g. /ping
 */
export const request = (address: string, path: string) => {
  try {
    const [, protocol, host, port] = address.match(/^(https?):\/\/([^:]+):(.*)$/)!;
    const api = protocol === 'http' ? http : https;
    const options = {
      hostname: host,
      port,
      path,
      method: 'GET'
    };

    return new Promise<string>((resolve, reject) => {
      const req = api.request(options, (res) => {
        res.on('data', (d) => {
          resolve(d.toString());
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  } catch (err) {
    throw new Error('Invalid address format');
  }
};
