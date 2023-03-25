import fs from 'fs';
import path from 'path';
import util from 'util';

import jsYaml from 'js-yaml';

const readFile = util.promisify(fs.readFile);

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const parseConfigs = async (configBasePath = '', env = {}) => {
  const configs = fs
    .readdirSync(configBasePath)
    .filter((name) => name.endsWith('.yml'))
    .map((fileName) => ({
      fileName,
      base: fileName.replace('.yml', ''),
      path: path.join(configBasePath, fileName),
    }));

  const readingConfigs = configs.map((config) =>
    readFile(config.path, 'utf-8'),
  );

  const ymlConfigs = await Promise.all(readingConfigs);

  const parsedJsonConfigs = ymlConfigs.map((yamlText) => jsYaml.load(yamlText));

  const compiledConfigs = parsedJsonConfigs.reduce(
    (all, next, i) => ((all[configs[i].base] = next), all),
    {},
  );

  const nonEmptyConfigs = Object.fromEntries(
    Object.entries(compiledConfigs).filter(
      (entry) => entry[1] !== undefined && entry[1] !== null,
    ),
  );

  // --- set up config.env ---

  if (!env.token) {
    const githubTokenPath = path.join(__dirname, '..', '..', 'github_token');
    env.token = fs.existsSync(githubTokenPath)
      ? (await readFile(githubTokenPath, 'utf-8')).trim()
      : '';
  }

  if (!env.repo && nonEmptyConfigs?.org?.home) {
    env.repo = nonEmptyConfigs.org.home;
  }
  if (!env.user && nonEmptyConfigs?.org?.name) {
    env.user = nonEmptyConfigs.org.name;
  }

  // this is how action info gets into the config
  nonEmptyConfigs.env = env;

  return nonEmptyConfigs;
};
