/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tse4.mm.bing.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;