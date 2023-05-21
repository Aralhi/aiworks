/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  reactStrictMode: false,
  transpilePackages: ["antd"],
  async redirects() {
    return [];
  }
};
