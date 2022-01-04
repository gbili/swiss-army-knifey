import path from "path";
import { arrayOf } from "./array";
export const backstepPath = (absBasePath: string, backsteps: number) => path.resolve(...[absBasePath, ...arrayOf('..')(backsteps)]);
export const prependDir = (dir: string) => (filename: string) => `${dir}${filename}`;
export const isUsedAsNodeModule = (dir: string) => dir.split('node_modules').length > 1;
export const getUserRootDirOrThrow = () => {
  if (!isUsedAsNodeModule(__dirname)) {
    throw new Error('Trying to get user root dir, but package does not seem to be installed as a node_module yet. Probably in dev.');
  }
  return __dirname.split('node_modules')[0];
};