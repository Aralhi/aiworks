/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  reactStrictMode: false,
  cssModules: true,
  async redirects() {
    return [];
  },
  exclude: [
    '/api/*'
  ]
};
