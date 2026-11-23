/** @type {import('next').NextConfig} */
const nextConfig = {
  // The WebGL scenes create and dispose their own renderer; skipping the dev-only double mount keeps hot reload smooth.
  reactStrictMode: false,
};

export default nextConfig;
