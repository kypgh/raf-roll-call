/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This app is single-user and low-traffic, so there's no real cost to
    // never caching a page in the browser between navigations -- but there
    // is a real cost (confusing stale data) to caching it even briefly.
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
