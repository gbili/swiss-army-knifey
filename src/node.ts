import { getFileContentsSync, putFileContentsSync } from "./utils/node/fsSync";
import { getCouldBeNodeModuleRootDir, getNodeModuleRootDir, isWithinNodeModuleOrClonedRepo, isWithinNodeModule, pathCouldBeNodeModuleRootDir, pathWithinCouldBeNodeModule } from "./utils/node/moduleOrClonedRepo";
import { getUserRootDirOrThrow, getRootDir } from "./utils/node/path";
import { createDir, createDirIfNotExists, existsDir, getFileContents, putFileContents } from "./utils/node/promiseFs";
import request, { createHeadersOptionWithCookie, createHeadersWithPHPSESSID, download, get, getPHPSESSIDWithoutPathOrEmpty } from "./utils/node/request";

export {
  createDir,
  createDirIfNotExists,
  createHeadersOptionWithCookie,
  createHeadersWithPHPSESSID,
  download,
  existsDir,
  get,
  getCouldBeNodeModuleRootDir,
  getFileContents,
  getFileContentsSync,
  getNodeModuleRootDir,
  getPHPSESSIDWithoutPathOrEmpty,
  getUserRootDirOrThrow,
  getRootDir,
  isWithinNodeModuleOrClonedRepo,
  isWithinNodeModule,
  pathCouldBeNodeModuleRootDir,
  pathWithinCouldBeNodeModule,
  putFileContents,
  putFileContentsSync,
  request,
};