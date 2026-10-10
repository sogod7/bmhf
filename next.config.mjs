/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/', destination: '/index.html' }];
  },
  async redirects() {
    return [{ source: '/board', destination: '/notices', permanent: true }];
  },
  images: { unoptimized: true },
};
export default nextConfig;
