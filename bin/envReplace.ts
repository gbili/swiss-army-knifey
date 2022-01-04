#!/usr/bin/env node
// import { getTemplateHydrator } from "../src/utils/envReplace";
import { getUserRootDirOrThrow, prependDir } from "../src/utils/path";
import { getTemplateHydrator } from "../src/utils/envReplace";

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
const hydrateTemplateSaveAs = getTemplateHydrator(sourceTemplateFilepath)
console.log(hydrateTemplateSaveAs(sourceTemplateFilepath, destFilepath));