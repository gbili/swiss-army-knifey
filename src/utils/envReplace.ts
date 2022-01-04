import 'dotenv/config';
import { compose } from 'ramda';
import { getFileContents, putFileContents } from './fs';

type DefinedDictElements = { [k: string]: string; };

const useDefinedAndDummyValueMissing = (processEnv: NodeJS.ProcessEnv) => (p: DefinedDictElements, c: string): DefinedDictElements => {
  const val = (processEnv[c] || `<!! -------  Missing '${c}' in .env file  ------- !!>`);
  return (val.length > 0)
  ? {
    ...p,
    [c]: val,
  }
  : { ...p };
};
const replaceOccurencesWithValues = (dict: DefinedDictElements) => (templateString: string, key: string) => {
  return templateString.replace(new RegExp(`${key}_VALUE`, 'g'), dict[key])
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

export const getPlaceholderToEnvValueDict = (placeholders: string[] | null) => null !== placeholders && placeholders.reduce(useDefinedAndDummyValueMissing(process.env), {}) || null;

export const getPlaceholders = (contents: string): string[] | null => contents.match(/[A-Z0-9_]+_VALUE/g);

export const getTemplateHydrator = compose(
  hydrateTemplateFromEnvAs,
  getPlaceholderToEnvValueDict,
  getPlaceholders,
  getFileContents
);