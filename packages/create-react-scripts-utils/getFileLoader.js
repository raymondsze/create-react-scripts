'use strict';

const getLoader = require('./getLoader');

function fileLoaderMatcher(rule) {
  return (
    rule.loader &&
    typeof rule.loader === 'string' &&
    rule.loader.indexOf('file-loader') !== -1
  );
}

function getFileLoader(config) {
  return getLoader(config, fileLoaderMatcher);
}

module.exports = getFileLoader;
