#!/usr/bin/env node

import path from 'path';

import { compileEnv } from '../src/compile-env/index.js';
import { parseConfigs } from '../src/parse-configs/index.js';
import { persistConfigs } from '../src/persist-configs/index.js';

import { manageCollaborators } from '../src/api-calls/manage-collaborators.js';

// --- compile env from CLI args & defaults ---

const env = compileEnv(process.argv.slice(2));

// --- parse school configs ---

const configPath = path.join(process.cwd(), ...env.configPath);
const configs = await parseConfigs(configPath, env);

// --- manage org collaborators ---

await manageCollaborators(configs);

// -- all done --

await persistConfigs(configPath, configs);
