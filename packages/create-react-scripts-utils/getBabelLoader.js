'use strict';

const getLoader = require('./getLoader');

function babelLoaderMatcher(rule) {
  return (
    rule.loader &&
    typeof rule.loader === 'string' &&
    rule.loader.indexOf('babel-loader') !== -1
  );
}

function getBabelLoader(config) {
  return getLoader(config, babelLoaderMatcher);
}

module.exports = getBabelLoader;
