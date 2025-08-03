/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@starguard/shared'],
  experimental: {
    optimizeCss: true,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${backendUrl}/socket.io/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;