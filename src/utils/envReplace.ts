import { compose } from 'ramda';
import { getFileContentsSync, putFileContentsSync } from './node/fsSync';

type DefinedDictElements = { [k: string]: string; };
export const remove_VALUE = (c: string) => c.substring(0, c.length - '_VALUE'.length);

const useDefinedAndDummyValueMissing = (processEnv: NodeJS.ProcessEnv) => (p: DefinedDictElements, c: string): DefinedDictElements => {
  const keyWithout_VALUE = remove_VALUE(c);
  const val = processEnv[keyWithout_VALUE] || `<!! -------  Missing '${keyWithout_VALUE}' in .env file  ------- !!>`;
  return (val.length > 0)
  ? {
    ...p,
    [c]: val,
  }
  : { ...p };
};
const replaceOccurencesWithValues = (dict: DefinedDictElements) => (templateString: string, key: string) => {
  return templateString.replace(new RegExp(key, 'g'), dict[key])
};
export const hydrateTemplateFromEnvAs = (stringEnvVars: DefinedDictElements) => (templateFilepath: string, destinationFilepath: string) => {
  if (Object.keys(stringEnvVars).length <= 0) {
    return 'Did nothing';
  }
  const dockerComposeTemplateString = getFileContentsSync(templateFilepath);
  const replacedTemplate = Object.keys(stringEnvVars)
    .reduce(
      replaceOccurencesWithValues(stringEnvVars),
      dockerComposeTemplateString
    );
  putFileContentsSync(destinationFilepath, replacedTemplate);
  return `Wrote file ${destinationFilepath}`;
};

export const getPlaceholderToEnvValueDict = (placeholders: string[]) => (env: NodeJS.ProcessEnv) => placeholders.reduce(useDefinedAndDummyValueMissing(env), {});

export const getPlaceholders = (contents: string): string[] => contents.match(/[A-Z0-9_]+_VALUE/g) || [];

export const getHydratablePlaceholders = compose(
  getPlaceholderToEnvValueDict,
  getPlaceholders,
  getFileContentsSync
);