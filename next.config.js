/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use static export for GitHub Pages build
  ...(process.env.GITHUB_PAGES && {
    output: 'export',
    basePath: '/toolist',
    assetPrefix: '/toolist/',
    images: {
      unoptimized: true,
    },
  }),
  webpack: (config) => {
    // chokidar-issue-fix
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

module.exports = nextConfig;
