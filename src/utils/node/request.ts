import fs from 'fs';
import http from 'http';
import https from 'https';
import { compose } from '../compose';

type Resolve<T> = T & { response: http.IncomingMessage; };

export const getProperHttpModuleFromScheme = (url: URL) => url.protocol === 'https:' ? https : http;

export const download = async function (uri: string, dest: string, options?: https.RequestOptions) {
  return new Promise(function (resolve: (res: Resolve<{ file: string; }>) => void, reject: (err: Error) => void){
    const { get } = getProperHttpModuleFromScheme(new URL(uri));
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
  return new Promise<Resolve<{ success: boolean }>>((resolve, reject) => {
    const { get } = getProperHttpModuleFromScheme(new URL(uri));
    const handler = (resp: http.IncomingMessage) => {
      if (resp.statusCode && resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        return get(resp.headers.location, options || {}, handler);
      }
      if (resp.statusCode && resp.statusCode !== 200) {
        return reject(new Error(`Unsupported code or Error code ${resp.statusCode}`));
      }
      let i = 0;
      const downloadNChunks = 15;
      resp.on('data', (_: Buffer) => {
        if (i++ >= downloadNChunks) resp.destroy();
      });
      resp.on('close', () => resolve({ success: i > downloadNChunks, response: resp }))
      resp.on('error', (err) => reject(err));
    };
    get(uri, options || {}, handler).on("error", reject);
  });
}

const getPathWithQueryString = (url: URL) => url.pathname + url.search;

export const urlToOptions = (url: URL, options: SAKRequestOptions) => {
  return {
    hostname: url.host,
    port: url.protocol === 'https:' ? 443 : 80,
    path: getPathWithQueryString(url),
    ...options,
  };
}

export type SAKRequestOptions = ((https.RequestOptions & { data?: undefined; }) | (https.RequestOptions & { method: 'POST'; data: string; })) & { statusCodeHandler?: (statusCode?: number) => void; };

export const request = async function (uri: string, options?: SAKRequestOptions) {
  return new Promise(function (resolve: (res: Resolve<{ data: string; }>) => void, reject: (err: Error) => void){
    const url = new URL(uri);
    const { request } = getProperHttpModuleFromScheme(url);
    const standardOptions = urlToOptions(url, options || {});
    const req = request(standardOptions, (resp) => {
      if (options && options.statusCodeHandler) {
        options.statusCodeHandler(resp.statusCode);
      }
      let data = '';
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        if (!resp.complete) {
          reject(new Error('The connection was terminated while the message was still being sent'));
          return;
        }
        resolve({ data, response: resp });
      });
    })
    req.on("error", (err) => {
      reject(err);
    });
    if (options && options.method === 'POST') {
      req.write(options.data || '');
    }
    req.end();
  });
}

export const get = request;

export const getPHPSESSIDWithoutPathOrEmpty = <Z, T extends Resolve<Z>>(res: T extends Resolve<infer O> ? Resolve<O> : never): string[] => res.response.headers['set-cookie']
  ? res.response.headers['set-cookie'].filter(v => v.substring(0, 'PHPSESSID'.length) === 'PHPSESSID').map(v => v.split(';')[0])
  : [];

export const createHeadersOptionWithCookie = (cookiesString?: string) => {
  return {
    headers : cookiesString ? { Cookie: cookiesString } : {},
  };
};

const firstElementOrUndefined = (a: string[]): string | undefined => a[0];
export const createHeadersWithPHPSESSID = compose(createHeadersOptionWithCookie, firstElementOrUndefined, getPHPSESSIDWithoutPathOrEmpty);

export const getBearerToken = <Z, T extends Resolve<Z>>(res: T extends Resolve<infer O> ? Resolve<O> : never): string | undefined => {
  const authHeader = res.response.headers['authorization'];
  if (typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.split('Bearer ')[1]; // Remove "Bearer " (7 characters)
    }
  }
  return undefined;
};

export const createHeadersOptionWithBearerToken = (token?: string) => {
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  };
};

export const createHeadersWithBearerToken = compose(createHeadersOptionWithBearerToken, getBearerToken);

export default request;