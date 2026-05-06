/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
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
  async headers() {
    return [
      {
        // Embeddable widget — allow framing from anywhere.
        // Embedders are responsible for vetting the source they render.
        source: "/embed",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
