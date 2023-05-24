/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true }
    return config
  },
};
