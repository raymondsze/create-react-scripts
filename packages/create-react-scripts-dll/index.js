'use strict';

const path = require('path');
const webpack = require('webpack');
const AutoDllPlugin = require('autodll-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

module.exports = options => ({
  webpack(config, env) {
    const appPackageJson = path.join(process.cwd(), 'package.json');
    const vendor = require(appPackageJson).vendor || [];
    const dllPlugins = [];
    // uglify the vendor js if in production mode
    if (env === 'production') {
      dllPlugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          comparisons: false,
        },
        output: {
          comments: false,
          ascii_only: true,
        },
        sourceMap: shouldUseSourceMap,
      }));
    }
    config.plugins.push(
      new AutoDllPlugin(Object.assign({
        inject: true,
        filename: '[name].[hash:8].js',
        path: './static/js/',
        entry: { vendor },
        plugins: dllPlugins,
      }, options))
    );
    return config;
  },
});
