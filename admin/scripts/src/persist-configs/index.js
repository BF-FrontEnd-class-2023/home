import path from 'path';
import fs from 'fs';
import util from 'util';

import { dump } from 'js-yaml';

const writeFile = util.promisify(fs.writeFile);

export const persistConfigs = async (configBasePath = '', configs = {}) => {
  const configWrites = [];
  for (const key in configs) {
    if (key === 'env') {
      continue;
    }

    const configPath = path.join(configBasePath, `${key}.yml`);
    const ymlConfigText = dump(configs[key]);
    configWrites.push(writeFile(configPath, ymlConfigText, 'utf-8'));
  }

  await Promise.all(configWrites);
};
