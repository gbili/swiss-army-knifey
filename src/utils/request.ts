import fs from 'fs';
import http from 'http';
import https from 'https';

type Resolve<T> = T & { response: http.IncomingMessage; };

export const getProperHttpModuleFromScheme = (uri: string) => uri.match(/^https:\/\//g) !== null ? https : http;

export const download = async function (uri: string, dest: string, options?: https.RequestOptions) {
  return new Promise(function (resolve: (res: Resolve<{ file: string; }>) => void, reject: (err: Error) => void){
    const { get } = getProperHttpModuleFromScheme(uri);
    if (fs.existsSync(dest)) return reject(new Error('File already exists, choose a different destination'));
    get(uri, options || {}, (resp) => {
      if (resp.statusCode !== 200) return reject(new Error(`Unsupported server response code: ${resp.statusCode}`));
      const file = fs.createWriteStream(dest);
      resp.pipe(file)
      file.on('finish', () => {
        // The whole response has been received. Print out the result.
        resolve({ file: dest, response: resp });
      });
    }).on("error", (err) => {
      if (fs.existsSync(dest)) {
        fs.unlink(dest, (err) => {
          if (err) reject(err);
        });
      }
      reject(err);
    });
  });
}

export const couldDownload = async function (uri: string, options?: https.RequestOptions) {
  return new Promise(function (resolve: (res: Resolve<{ success: boolean; }>) => void, reject: (err: Error) => void){
    const { get } = getProperHttpModuleFromScheme(uri);
    const handler = (resp: http.IncomingMessage) => {
      if (resp.statusCode && resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) return get(resp.headers.location, options || {}, handler);
      if (resp.statusCode && resp.statusCode !== 200) return reject(new Error(`Unsupported code or Error code ${resp.statusCode}`));
      let i = 0;
      const downloadNChunks = 15;
      resp.on('data', (_: Buffer) => {
        if (i++ >= downloadNChunks) return resp.destroy();
      });
      resp.on('close', () => resolve({ success: i > downloadNChunks, response: resp }))
      resp.on('error', (err) => reject(err));
    };
    get(uri, options || {}, handler).on("error", (err) => {
      reject(err);
    });
  });
}

export const request = async function (uri: string, options?: https.RequestOptions) {
  return new Promise(function (resolve: (res: Resolve<{ data: string; }>) => void, reject: (err: Error) => void){
    const { request } = getProperHttpModuleFromScheme(uri);
    request(uri, options || {}, (resp) => {
      let data = '';
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve({ data, response: resp });
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

export const get = request;

export default request;