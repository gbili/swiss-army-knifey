import path from "path";
import { arrayOf } from "./array";
export const backstepPath = (absBasePath: string, backsteps: number) => path.resolve(...[absBasePath, ...arrayOf('..')(backsteps)]);
export const prependDir = (dir: string) => (filename: string) => `${dir}${filename}`;
export const isUsedAsNodeModule = (dir: string) => dir.split('/node_modules').length > 1;
export const getUserRootDirOrThrow = (callingProjectDir: string = __dirname) => {
  if (!isUsedAsNodeModule(callingProjectDir)) {
    throw new Error('Trying to get user root dir, but package does not seem to be installed as a node_module yet. Probably in dev.');
  }
  return callingProjectDir.split('/node_modules')[0];
};

export const getRootDir = (callingProjectDir: string, buildDistDirName: string = 'build') => {
  return isUsedAsNodeModule(callingProjectDir) ? getUserRootDirOrThrow(callingProjectDir) : callingProjectDir.split(`/${buildDistDirName}`)[0];
}