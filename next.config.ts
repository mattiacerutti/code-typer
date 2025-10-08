import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/game",
        permanent: false,
      },
    ];
  },
  webpack: (config, {isServer}) => {
    if (isServer) {
      config.externals.push({
        "tree-sitter": "commonjs tree-sitter",
        "tree-sitter-javascript": "commonjs tree-sitter-javascript",
        "tree-sitter-typescript/typescript": "commonjs tree-sitter-typescript/typescript",
        "tree-sitter-c": "commonjs tree-sitter-c",
        "tree-sitter-cpp": "commonjs tree-sitter-cpp",
        "tree-sitter-c-sharp": "commonjs tree-sitter-c-sharp",
        "tree-sitter-java": "commonjs tree-sitter-java",
        "tree-sitter-python": "commonjs tree-sitter-python",
        "tree-sitter-lua": "commonjs tree-sitter-lua",
        "tree-sitter-compat": "commonjs tree-sitter-compat",
      });
    }

    return config;
  },
};

export default nextConfig;
