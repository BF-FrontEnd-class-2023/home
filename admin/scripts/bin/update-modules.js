#!/usr/bin/env node

import path from 'path';

import { compileEnv } from '../src/compile-env/index.js';
import { parseConfigs } from '../src/parse-configs/index.js';
import { persistConfigs } from '../src/persist-configs/index.js';

import { manageMilestones } from '../src/api-calls/manage-milestones.js';

// --- compile env from CLI args & defaults ---

const env = compileEnv(process.argv.slice(2));

// --- parse school configs ---

const configPath = path.join(process.cwd(), ...env.configPath);
const configs = await parseConfigs(configPath, env);

// --- do the things ---

await manageMilestones(configs);

// --- save changes to config & README---

await persistConfigs(configPath, configs);
