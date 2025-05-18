/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Or your existing config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.yildizskylab.com',
        port: '', // Keep empty if no specific port
        pathname: '/api/images/getImageByUrl/**', // Or more specific if needed
      },
      // You can add other domains here if needed
    ],
  },
  // ... any other configurations
};

module.exports = nextConfig;
