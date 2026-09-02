import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Forzar el compilador de React 19
  reactCompiler: true,

  // 2. Configuración de Orígenes (Formato estricto para Red Local)
  // Probaremos pasando tanto el comodín como la IP detectada para asegurar el "match"
  allowedDevOrigins: ["*", "172.16.5.9", "localhost:3000"],

  // 3. Configuración de Webpack para estabilidad y memoria
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.cache = false;
      
      // Ajuste para asegurar que los WebSockets de HMR (Hot Module Replacement) 
      // funcionen a través de la red local sin ser bloqueados
      config.devServer = {
        ...config.devServer,
        allowedHosts: 'all',
      };
    }
    return config;
  },

  // 4. Cabeceras de seguridad para desarrollo
  // Esto ayuda a que el navegador de la PC cliente no bloquee los scripts de Next
  async headers() {
    return [
      {
        source: "/_next/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },

  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
