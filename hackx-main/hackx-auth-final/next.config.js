/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: true, // Temporarily disable to fix OOM crash on Vercel
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*, geolocation=*",
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);