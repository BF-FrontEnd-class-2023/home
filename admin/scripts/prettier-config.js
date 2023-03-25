import prettier from 'prettier';

export const prettierConfig = {
  ...(await prettier.resolveConfig(process.cwd())),
  parser: 'markdown',
};
