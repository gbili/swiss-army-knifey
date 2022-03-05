import { readFileSync, writeFileSync } from "fs";
export const getFileContentsSync = (filepath: string) => `${readFileSync(filepath, 'utf-8')}`;
export const putFileContentsSync = (filePath: string, contents: string) => writeFileSync(filePath, contents, { mode: 0o664 });