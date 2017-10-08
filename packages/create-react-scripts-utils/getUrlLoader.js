'use strict';

const getLoader = require('./getLoader');

function urlLoaderMatcher(rule) {
  return (
    rule.loader &&
    typeof rule.loader === 'string' &&
    rule.loader.indexOf('url-loader') !== -1
  );
}

function getUrlLoader(config) {
  return getLoader(config, urlLoaderMatcher);
}

module.exports = getUrlLoader;
