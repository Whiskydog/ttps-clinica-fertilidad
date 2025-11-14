
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ReactQueryProvider from "../components/ReactQueryProvider";
import { Toaster  } from "@repo/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Clinica de Fertilidad",
  description: "Sistema de gestión de clínica de fertilidad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Toaster position="top-center" richColors />
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
