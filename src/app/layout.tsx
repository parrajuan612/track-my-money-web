import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers"; // Llamamos al agrupadór que acabamos de configurar

export const metadata: Metadata = {
  title: "Track My Money",
  description: "MVP de finanzas personales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}