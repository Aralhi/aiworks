/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [];
  },
  exclude: [
    '/api/*'
  ]
};
