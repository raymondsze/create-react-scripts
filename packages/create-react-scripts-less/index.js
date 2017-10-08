const path = require('path');
const { getCssLoader, getFileLoader } = require('create-react-scripts-utils');

module.exports = options => ({
  webpack(config, env) {
    const fileLoader = getFileLoader(config);
    fileLoader.exclude.push(/\.less$/);

    const cssRules = getCssLoader(config);
    let lessRules;
    if (env === 'production') {
      lessRules = {
        test: /\.less$/,
        loader: [].concat(
          cssRules.loader
        ).concat(
          [{
            loader: require.resolve('less-loader'),
            options,
          }]
        ).filter(l => l)
      };
    } else {
      lessRules = {
        test: /\.less$/,
        use: [].concat(
          cssRules.use
        ).concat(
          [{
            loader: require.resolve('less-loader'),
            options,
          }]
        ).filter(l => l)
      };
    }
    config.module.rules.push(lessRules);
    return config;
  },
});
