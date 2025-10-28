import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      "@myriaddreamin/typst-ts-node-compiler": "commonjs @myriaddreamin/typst-ts-node-compiler",
      "@myriaddreamin/typst-ts-node-compiler-linux-x64-gnu":
        "commonjs @myriaddreamin/typst-ts-node-compiler-linux-x64-gnu",
      "@myriaddreamin/typst-ts-node-compiler-linux-x64-musl":
        "commonjs @myriaddreamin/typst-ts-node-compiler-linux-x64-musl",
    });
    config.module.rules.push({
      test: /\.node$/,
      loader: "node-loader",
    });
    return config;
  },
};

export default nextConfig;
