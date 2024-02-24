/** @type {import('next').NextConfig} */
const nextConfig = {
  // webpack: (config) => {
  //   config.externals.push({
  //     "utf-8-validate": "commonjs utf-8-validate",
  //     bufferutil: "commonjs bufferutil"
  //   })
  // },
  images: {
    remotePatterns: [
      {
        hostname: "utfs.io"
      }
    ]
  }
};

export default nextConfig;
