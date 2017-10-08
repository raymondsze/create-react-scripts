'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

if (!process.env.CRS_SKIP_REWIRE) require('../rewire')();

// Remove additional crs-config arguments
const crsIndex = process.argv.findIndex(x => x === '--crs-config');
const scriptArgs = crsIndex >= 0 ? process.argv.slice(0, crsIndex) : [];
process.argv = scriptArgs;

require('react-scripts/scripts/test');
