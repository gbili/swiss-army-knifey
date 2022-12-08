import path from 'path';

export type MtbEnv = 'clone' | 'module';
export type ExistsDirFunc = (dirpath: string) => Promise<boolean>;
export type IsWithinNodeModuleOrClonedRepo = (projectRootDirpath: string, existsDir: ExistsDirFunc) => Promise<MtbEnv>

// Path may not exists and this will still return true
export const pathCouldBeNodeModuleRootDir = function (projectRootDirpath: string) {
  const absProjectRootDirPath = path.resolve(projectRootDirpath);
  const match = absProjectRootDirPath.match(/\/node_modules\/[^\\/]+$/g);
  return match !== null && match.length > 0;
}

export const pathWithinCouldBeNodeModule = function (somePath: string) {
  const absPath = path.resolve(somePath);
  const match = absPath.match(/\/node_modules\/[^\\/]+/g);
  return match !== null && match.length > 0;
}

export const getCouldBeNodeModuleRootDir = function (somePathWithinModule: string) {
  if (!pathWithinCouldBeNodeModule(somePathWithinModule)) {
    throw new Error(`Path does not seem to be within a node module: "${somePathWithinModule}"`);
  }
  const absPath = path.resolve(somePathWithinModule);
  const match = absPath.match(/.{0,}\/node_modules\/[^\\/]+/g);
  return match !== null ? match[0] : ""; // "" never reached
}

export const isWithinNodeModuleOrClonedRepo = async function (somePath: string, existsDir: ExistsDirFunc) {
  const isWithinCouldBeNodeModule = pathWithinCouldBeNodeModule(somePath);
  const absSomePath = path.resolve(somePath);
  const providedPathExists = await existsDir(absSomePath);
  if (!providedPathExists) {
    throw new Error(`You provided a non existing project root path: "${absSomePath}" does not exist`);
  }
  return isWithinCouldBeNodeModule
    ? 'module'
    : 'clone';
}

export const isWithinNodeModule = async function (projectRootDirpath: string, existsDir: ExistsDirFunc) {
  return await isWithinNodeModuleOrClonedRepo(projectRootDirpath, existsDir) === 'module';
}

export const getNodeModuleRootDir = async function (somePathWithinNodeModule: string, existsDir: ExistsDirFunc) {
  const isWithin = await isWithinNodeModule(somePathWithinNodeModule, existsDir);
  if (!isWithin) {
    throw new Error(`Make sure to pass an existing path within a node module, passed: ${somePathWithinNodeModule}`);
  }
  const exsitingNodeModuleRootAbsDir = getCouldBeNodeModuleRootDir(somePathWithinNodeModule);
  return exsitingNodeModuleRootAbsDir;
}

export default {
  pathCouldBeNodeModuleRootDir,
  pathWithinCouldBeNodeModule,
  getCouldBeNodeModuleRootDir,
  isWithinNodeModuleOrClonedRepo,
  isWithinNodeModule,
  getNodeModuleRootDir,
};