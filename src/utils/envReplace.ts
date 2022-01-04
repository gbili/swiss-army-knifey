import { compose } from 'ramda';
import { getFileContents, putFileContents } from './fs';

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
export const hydrateTemplateFromEnvAs = (stringEnvVars: DefinedDictElements | null) => (templateFilepath: string, destinationFilepath: string) => {
  if (stringEnvVars === null) {
    return 'Did nothing';
  }
  const dockerComposeTemplateString = getFileContents(templateFilepath);
  const replacedTemplate = Object.keys(stringEnvVars)
    .reduce(
      replaceOccurencesWithValues(stringEnvVars),
      dockerComposeTemplateString
    );
  putFileContents(destinationFilepath, replacedTemplate);
  return `Wrote file ${destinationFilepath}`;
};

export const getPlaceholderToEnvValueDict = (placeholders: string[] | null) => (env: NodeJS.ProcessEnv) => null !== placeholders && placeholders.reduce(useDefinedAndDummyValueMissing(env), {}) || null;

export const getPlaceholders = (contents: string): string[] | null => contents.match(/[A-Z0-9_]+_VALUE/g);

export const getHydratablePlaceholders = compose(
  getPlaceholderToEnvValueDict,
  getPlaceholders,
  getFileContents
);