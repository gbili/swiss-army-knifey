#!/usr/bin/env node
import 'dotenv/config';
import readline from 'readline';
import { compose, join, map } from "ramda";
import { getPlaceholders, remove_VALUE } from "../src/utils/envReplace";
import { getFileContents, putFileContents } from '../src/utils/fs';
import { getUserRootDirOrThrow, prependDir } from "../src/utils/path";

const [,, ...args] = process.argv

// const [sourceTemplateFilename, destFilename] = args;
if (args.length !== 2) {
  console.log('Bad usage. Call this with two arguments <someFile.tmpl> <destfile>');
  process.exit(1)
}

// bin/build/swiss-army-knifey/node_modules/user-project-root
const userProjectRootDir = getUserRootDirOrThrow();
const getFilePath = prependDir(userProjectRootDir);
const [sourceTemplateFilepath, destFilepath] = args.map(getFilePath);

const envFileContents = compose(
  join("=\n"),
  map(remove_VALUE),
  getPlaceholders,
  getFileContents
)(sourceTemplateFilepath);

if (envFileContents.length <= 0) {
  console.log(`No <SOME_VAR>_VALUE placeholders found in the specified source ${sourceTemplateFilepath}. Thus, ${destFilepath} was not written`);
  process.exit(0)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`The file ${destFilepath} will be overwritten, are you sure you want to continue? [Y/n]`, (answer) => {
  if (answer !== 'n') {
    putFileContents(destFilepath, envFileContents);
    console.log(`Wrote file ${destFilepath}`);
  }
  rl.close();
});

console.log(`Finished`);