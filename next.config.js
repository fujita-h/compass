const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  poweredByHeader: false,
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
})
