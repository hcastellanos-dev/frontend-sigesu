"use client";

import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Definimos si la ruta actual pertenece al dashboard
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <html lang="es">
      <head>
        <title>SIGESU - UPN</title>
        <link 
          rel="icon" 
          type="image/svg+xml" 
          href="https://upload.wikimedia.org/wikipedia/commons/6/60/Logo_Upn_Oficial.svg" 
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        {/* Solo mostramos el Header público si NO es dashboard */}
        {!isDashboard && <Header />}

        <main className={!isDashboard ? "flex-1" : ""}>
          <AuthProvider>{children}</AuthProvider>
        </main>

        {/* Solo mostramos el Footer público si NO es dashboard */}
        {!isDashboard && <Footer />}
      </body>
    </html>
  );
}