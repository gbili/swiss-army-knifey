import fs from 'fs';
import http from 'http';
import https from 'https';

type Resolve<T> = T & { response: http.IncomingMessage; };

export const getProperHttpModuleFromScheme = (uri: string) => uri.match(/^https:\/\//g) !== null ? https : http;

export const download = async function (uri: string, dest: string, options?: https.RequestOptions) {
  return new Promise(function (resolve: (res: Resolve<{ file: string; }>) => void, reject: (err: Error) => void){
    const { get } = getProperHttpModuleFromScheme(uri);
    const file = fs.createWriteStream(dest);
    get(uri, options || {}, (resp) => {
      resp.pipe(file)
      file.on('finish', () => {
        // The whole response has been received. Print out the result.
        resolve({ file: dest, response: resp });
      });
    }).on("error", (err) => {
      fs.unlink(dest, (err) => {
        if (err) reject(err);
      });
      reject(err);
    });
  });
}

export const get = async function (uri: string, options?: https.RequestOptions) {
  return new Promise(function (resolve: (res: Resolve<{ data: string; }>) => void, reject: (err: Error) => void){
    const { get } = getProperHttpModuleFromScheme(uri);
    get(uri, options || {}, (resp) => {
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

export default get;