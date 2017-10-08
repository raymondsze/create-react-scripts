const path = require('path');
const AutoDllPlugin = require('autodll-webpack-plugin');

module.exports = options => ({
  webpack(config) {
    const appPackageJson = path.join(process.cwd(), 'package.json');
    const vendor = require(appPackageJson).vendor || [];
    config.plugins.push(
      new AutoDllPlugin(Object.assign({
        inject: true,
        filename: '[name].[hash:8].js',
        path: './static/js',
        entry: { vendor },
      }, options))
    );
    return config;
  },
});
