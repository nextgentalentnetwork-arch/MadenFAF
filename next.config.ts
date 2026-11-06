import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  serverExternalPackages: ['@supabase/supabase-js'],
  experimental: {
    devtoolSegmentExplorer: false,
    cpus: 1,
    workerThreads: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow access to remote image placeholder and authentic sports photography
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  transpilePackages: ['motion'],
  onDemandEntries: {
    maxInactiveAge: 120 * 1000,
    pagesBufferLength: 4,
  },
  async redirects() {
    return [
      {
        source: '/portal/player',
        destination: '/trials',
        permanent: false,
      },
      {
        source: '/portal/parent',
        destination: '/parent-experience',
        permanent: false,
      },
      {
        source: '/portal/coach',
        destination: '/coaches',
        permanent: false,
      },
      {
        source: '/portal/donator',
        destination: '/portal?role=member',
        permanent: false,
      },
      {
        source: '/portal/donor',
        destination: '/portal?role=member',
        permanent: false,
      },
      {
        source: '/portal/supporter',
        destination: '/portal?role=member',
        permanent: false,
      },
      {
        source: '/developer/backgrounds',
        destination: '/developer/sections',
        permanent: false,
      },
      {
        source: '/developer/background',
        destination: '/developer/sections',
        permanent: false,
      },
      {
        source: '/admission',
        destination: '/join?type=admission',
        permanent: false,
      },
      {
        source: '/trial',
        destination: '/trials',
        permanent: false,
      },
      {
        source: '/trial-registration',
        destination: '/join?type=trial',
        permanent: false,
      },
      {
        source: '/membership',
        destination: '/portal?role=member',
        permanent: false,
      },
      {
        source: '/donation',
        destination: '/portal?role=member',
        permanent: false,
      },
      {
        source: '/donations',
        destination: '/portal?role=member',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url' },
        ],
      },
    ];
  },
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
