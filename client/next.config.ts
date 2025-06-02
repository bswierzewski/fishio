import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Protokół używany przez Pixabay
        hostname: 'cdn.pixabay.com', // Hostname, z którego chcesz ładować obrazy
        port: '', // Zostaw puste dla standardowych portów (80, 443)
        pathname: '/**' // Pozwól na dowolną ścieżkę na tym hoście (np. /photo/...)
      },
      // Możesz tu dodać inne dozwolone hostnames w przyszłości
      // np. dla Cloudinary, jeśli będziesz go używać
      {
        protocol: 'https', // Protokół używany przez Cloudinary
        hostname: 'res.cloudinary.com', // Hostname, z którego chcesz ładować obrazy
        port: '', // Zostaw puste dla standardowych portów (80, 443)
        pathname: '/djmnsaieb/**' // Dostosuj do swojej nazwy chmury
      },
      // Clerk image domains for user profile pictures
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
