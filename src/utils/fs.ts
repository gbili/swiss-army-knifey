import { readFileSync, writeFileSync } from "fs";
export const getFileContents = (filepath: string) => `${readFileSync(filepath, 'utf-8')}`;
export const putFileContents = (filePath: string, contents: string) => writeFileSync(filePath, contents, { mode: 0o664 });