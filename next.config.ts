import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aktifkan kompresi gzip/brotli untuk semua response
  compress: true,
  // Hapus header X-Powered-By (minor security + perf)
  poweredByHeader: false,
  devIndicators: {
    position: "top-right",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Optimasi tree-shaking untuk library besar
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "react-icons",
      "@tabler/icons-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/rapier"
    ],
  },
};

export default nextConfig;
