'use strict';

const path = require('path');

// pipe rewire
// do not use recursion here to prevent maximum call stack
function pipe(funcs) {
  return function pipeRewire(config) {
    const args = Array.prototype.slice.call(arguments, 1);
    (funcs || []).forEach(func => {
      if (func && typeof func === 'function') {
        // slice the first argument "config"
        config = func.apply(this, [config].concat(args));
      }
    });
    return config;
  };
}

// merge scripts and remove the duplicates
// do not use recursion here to prevent maximum call stack
function mergeScripts(crsScripts) {
  const scripts = {
    build: path.join(__dirname, 'scripts/build.js'),
    start: path.join(__dirname, 'scripts/start.js'),
    test: path.join(__dirname, 'scripts/test.js'),
  };
  crsScripts.forEach(scriptSet => {
    Object.assign(scripts, scriptSet || {});
  });
  return scripts;
}

// this function is used to compose multiple configs into one config
function compose(...args) {
  // convert pipe to compose by reverse the array
  const crsConfigs = args.slice(0).reverse();
  const crsConfig = {
    env: pipe(crsConfigs.map(c => c.env)),
    paths: pipe(crsConfigs.map(c => c.paths)),
    webpack: pipe(crsConfigs.map(c => c.webpack)),
    devServer: pipe(crsConfigs.map(c => c.devServer)),
    jest: pipe(crsConfigs.map(c => c.jest)),
    scripts: mergeScripts(crsConfigs.map(c => c.scripts)),
  };
  return crsConfig;
};

module.exports = compose;
