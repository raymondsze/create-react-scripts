const fs = require('fs');
const path = require('path');
const { getFileLoader } = require('create-react-scripts-utils');

module.exports = options => ({
  webpack(config, env) {
    const fileLoader = getFileLoader(config);
    fileLoader.exclude.push(/\.(graphql|gql)$/);

    const graphqlRules = {
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: require.resolve('graphql-tag/loader'),
      options: options,
    };
    config.module.rules.push(graphqlRules);

    return config;
  },
  jest(config, env) {
    config.transform = Object.assign(config.transform, {
      '\\.(gql|graphql)$': require.resolve('jest-transform-graphql'),
    });
    return config;
  },
});
