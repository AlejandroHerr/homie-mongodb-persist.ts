module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript/base',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': { allowTypedFunctionExpressions: true },
  },
};
