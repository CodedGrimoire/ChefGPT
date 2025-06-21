/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Optional, but good practice for catching potential issues
  experimental: {
    appDir: true, // Enable app directory for Next.js 13
  },
  redirects: async () => {
    return [
      {
        source: '/_not-found', // You can handle not found routes here if necessary
        destination: '/', // Redirect any undefined route to your main page
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
