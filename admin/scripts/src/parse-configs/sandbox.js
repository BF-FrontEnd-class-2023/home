import path from 'path';
import { fileURLToPath } from 'url';

import { parseConfigs } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pathToConfigs = path.join(__dirname, '..', '..');

const jsonConfigs = await parseConfigs(pathToConfigs);

console.log(jsonConfigs);
