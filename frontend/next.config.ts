/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external sources (Cloudinary etc later)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // Proxy /api requests to the backend so the browser sees same-origin
  // This avoids cross-site cookie issues with subdomain ↔ localhost
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;