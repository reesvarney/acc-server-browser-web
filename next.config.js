/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: { images: { allowFutureImage: true } },
  webpack: (config) =>{
    config.experiments = {
      ...config.experiments,
      ...{"topLevelAwait": true}
    }
    return config
  },
}
if(process.env.ANALYZE === 'true'){
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true'
  })
  module.exports = withBundleAnalyzer(nextConfig)
} else {
  module.exports = nextConfig
}