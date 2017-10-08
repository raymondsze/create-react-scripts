'use strict';

const getLoader = require('./getLoader');

function eslintLoaderMatcher(rule) {
  return (
    rule.loader &&
    typeof rule.loader === 'string' &&
    rule.loader.indexOf('eslint-loader') !== -1
  );
}

function getEslintLoader(config) {
  return getLoader(config, eslintLoaderMatcher);
}

module.exports = getEslintLoader;
