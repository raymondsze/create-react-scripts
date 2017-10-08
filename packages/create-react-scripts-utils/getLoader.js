'use strict';

const _getLoader = function(rules, matcher) {
  let loader;
  rules.some(rule => (
    loader = matcher(rule) ? rule : _getLoader(rule.use || rule.oneOf || [], matcher)
  ));
  return loader;
};

const getLoader = function(config, matcher) {
  return _getLoader(config.module.rules, matcher);
}

module.exports = getLoader;
