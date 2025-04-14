const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 👇 Forzamos punto de entrada correcto
  config.entry = './index.js';

  return config;
};