const path = require('path');
const { getCssLoader, getFileLoader } = require('create-react-scripts-utils');

module.exports = options => ({
  webpack(config, env) {
    const fileLoader = getFileLoader(config);
    fileLoader.exclude.push(/\.scss$/);

    const cssRules = getCssLoader(config);
    let sassRules;
    if (env === 'production') {
      sassRules = {
        test: /\.scss$/,
        loader: [].concat(
          cssRules.loader
        ).concat(
          [{
            loader: require.resolve('sass-loader'),
            options,
          }]
        ).filter(l => l)
      };
    } else {
      sassRules = {
        test: /\.scss$/,
        use: [].concat(
          cssRules.use
        ).concat(
          [{
            loader: require.resolve('sass-loader'),
            options,
          }]
        ).filter(l => l)
      };
    }
    config.module.rules.push(sassRules);
    return config;
  },
});
