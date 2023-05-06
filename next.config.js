/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  reactStrictMode: false,
  async redirects() {
    return [];
  },
  exclude: [
    '/api/*'
  ]
};
