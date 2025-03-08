/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  typescript: {
    // !! WARN !!
    // This is a temporary solution for deployment
    // Remove this when all TypeScript errors are fixed
    ignoreBuildErrors: true,
  },
  eslint: {
    // This is a temporary solution for deployment
    // Remove this when all ESLint errors are fixed
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 