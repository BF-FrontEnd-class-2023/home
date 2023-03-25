import path from 'path';

import { ENV } from '../../defaults.js';

const keys = [
  'user',
  'repo',
  'token',
  'configPath',
  'readmePath',
  'assetsPath',
];

export const compileEnv = (args = []) =>
  Object.assign(
    ENV,
    args
      .map((arg) => {
        const key = keys.find((key) => arg.startsWith(`${key}=`));
        if (!key) {
          return null;
        }

        const keylessArg = arg.replace(`${key}=`, '');
        const value = key.includes('Path')
          ? keylessArg.split(path.sep)
          : keylessArg;

        return {
          [key]: value,
        };
      })
      .filter((arg) => arg !== null)
      .reduce((all, next) => Object.assign(all, next), {}),
  );
