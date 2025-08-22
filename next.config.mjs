// next.config.mjs (ESM)
import nextPWA from 'next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // enable SW only in prod
  // You can add runtimeCaching here later if you want
});

const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
};

export default withPWA(nextConfig);
