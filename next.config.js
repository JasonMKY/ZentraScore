const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    optimizePackageImports: ["date-fns", "@clerk/nextjs", "stripe"],
  },

  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), "ioredis"];
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      // Clerk server utils are not exported in package.json; shim needs this for Edge.
      "@clerk-internal/nextjs-server-utils": path.join(
        __dirname,
        "node_modules",
        "@clerk",
        "nextjs",
        "dist",
        "esm",
        "server",
        "utils.js"
      ),
    };
    // Clerk's clerkMiddleware.js imports `node:async_hooks`; Edge middleware cannot load it.
    // authMiddleware still imports that module for `createAuthenticateRequestOptions` only.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /[\\/]@clerk[\\/]nextjs[\\/]dist[\\/](esm|cjs)[\\/]server[\\/]clerkMiddleware\.js$/,
        path.join(__dirname, "lib/clerk-middleware-edge-shim.ts")
      )
    );
    return config;
  },
};

module.exports = nextConfig;
