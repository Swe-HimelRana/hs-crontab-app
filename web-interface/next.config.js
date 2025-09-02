/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/logs/:path*',
        destination: 'http://127.0.0.1:3001/api/logs/:path*',
      },
    ]
  },
}

module.exports = nextConfig
