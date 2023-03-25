import path from 'path';
import { fileURLToPath } from 'url';

import { parseConfigs } from '../parse-configs/index.js';
import { persistConfigs } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pathToConfigs = path.join(__dirname, '..', '..');

const jsonConfigs = await parseConfigs(pathToConfigs);

jsonConfigs.toes = { e: 2, w: [1, 2, 3] };

await persistConfigs(pathToConfigs, jsonConfigs);
