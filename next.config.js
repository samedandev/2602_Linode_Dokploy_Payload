import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

// const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
//   ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
//   : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // remotePatterns: [
    //   ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
    //     const url = new URL(item)

    //     return {
    //       hostname: url.hostname,
    //       protocol: url.protocol.replace(':', ''),
    //     }
    //   }),
    // ],
    remotePatterns: [
      {
        // hostname: process.env.NEXT_PUBLIC_SERVER_URL.split('https://')[1],
        // protocol: 'https',
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: [
      'payload-cms-application-fr1jdt-b8667c-172-232-62-38.traefik.me',
      'payload-cms-payload-vps-1qdv4j-97fcc3-176-169-113-147.traefik.me',
      'pub-c4022ec5f75d4f5583d2335dead3195d.r2.dev',
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
