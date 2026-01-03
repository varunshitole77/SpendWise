// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fix LAN dev warning (192.168.x.x hitting /_next/* in dev)
  // Format is DOMAIN (no scheme), wildcards allowed.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.1.5", "*.local"],

  // Only matters if you use Server Actions anywhere. It prevents
  // “Failed to find Server Action” when origin != host (LAN/proxy).
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "192.168.1.5:3000"],
      bodySizeLimit: "15mb",
    },
  },

  // Keep pdf-parse as external server dependency (stable bundling)
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
