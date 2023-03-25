import prettier from 'prettier';

import { top } from './top.js';
import { section } from './section.js';

import { module } from './components/module.js';
import { learner } from './components/learner.js';
import { coach } from './components/coach.js';
import { admin } from './components/admin.js';

import { prettierConfig } from '../../prettier-config.js';

export const renderReadme = (config = {}) =>
  Object.fromEntries(
    Object.entries({
      top: top(config),
      modules:
        config?.modules?.path?.length > 0
          ? section(config, {
              title: 'Modules',
              intro: config.modules.description,
              component: module,
              data: config.modules.path,
            })
          : '',
      learners:
        config?.learners?.length > 0
          ? section(config, {
              title: 'Learners',
              component: learner,
              data: config.learners,
            })
          : '',
      coaches:
        config?.coaches?.length > 0
          ? section(config, {
              title: 'Coaches',
              component: coach,
              data: config.coaches,
            })
          : '',
      admins:
        config?.admins?.length > 0
          ? section(config, {
              title: 'Admins',
              component: admin,
              data: config.admins,
            })
          : '',
    }).map((entry) => [entry[0], prettier.format(entry[1], prettierConfig)]),
  );
