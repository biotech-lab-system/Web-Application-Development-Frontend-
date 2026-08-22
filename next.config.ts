import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryName = "Web-Application-Development-Frontend-";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isGitHubPages ? "export" : "standalone",
  basePath: isGitHubPages ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPages ? `/${repositoryName}/` : "",
  trailingSlash: true,
};

export default nextConfig;
