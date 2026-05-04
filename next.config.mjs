import webpack from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        encoding: false,
      };
    }
    config.externals = config.externals || [];
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // MetaMask SDK references React Native's async-storage in the browser bundle.
    // We don't ship to RN, so silence the resolve.
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      })
    );
    return config;
  },
};

export default nextConfig;
