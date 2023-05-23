/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  headers: async () => {
    return [
      {
        source: "/api/chatgpt/get",
        headers: [
          {
            key: "Transfer-Encoding",
            value: "chunked",
          }
        ]
      },
    ];
  },
};
