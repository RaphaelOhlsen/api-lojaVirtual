module.exports = {
  env: {
    commonjs: true,
    es6: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 6,
  },
  rules: {
    'no-unused-vars': 0,
    'no-console': 0,
    'class-methods-use-this': 0,
    'no-param-reassign': 0,
    'consistent-return': 0,
    'comma-dangle': 0,
    'func-names': 0,
    'no-underscore-dangle':0,
  },
};
