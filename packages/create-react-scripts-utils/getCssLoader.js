'use strict';

const getLoader = require('./getLoader');

function cssLoaderMatcher(rule) {
  return String(rule.test) === String(/\.css$/);
}

function getCssLoader(config) {
  return getLoader(config, cssLoaderMatcher);
}

module.exports = getCssLoader;
