import fs from 'fs';

export const createDir = async function (absPath: string) {
  return await (new Promise(function(resolve, reject) {
    fs.mkdir(absPath, function(err) {
      if (err) { return reject(err); }
      return resolve(true);
    });
  }));
};

export const existsDir = async function (absPath: string): Promise<boolean> {
  return await (new Promise(function(resolve, reject) {
    fs.stat(absPath, function(err, stats) {
      const exists = true;
      if (err) {
        if (err.errno === -2) {
          return resolve(!exists);
        }
        return reject(err);
      }
      return resolve(exists);
    });
  }));
};

export const createDirIfNotExists = async function (absPath: string) {
  try {
    const exists = await existsDir(absPath);
    if (exists) { return true; }
    return await createDir(absPath);
  } catch (err) {
    throw err;
  }
};

export const getFileContents = async function (absPath: string, charset: BufferEncoding = 'utf8'): Promise<string> {
  return await (new Promise(function(resolve, reject) {
    fs.readFile(absPath, charset, function(err, data) {
      if (err) { return reject(err); }
      return resolve(data);
    });
  }));
};

export const putFileContents = async function (filePath: string, contents: string, options: fs.WriteFileOptions = { mode: 0o664 }): Promise<boolean> {
  return await (new Promise(function(resolve, reject) {
    fs.writeFile(filePath, contents, options, function(err) {
      if (err) { return reject(err); }
      return resolve(true);
    });
  }));
};

export const promiseFs = {
  createDir,
  existsDir,
  createDirIfNotExists,
};

export default promiseFs;