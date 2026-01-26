
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from 'next'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Operly - Panel de Control para Ventas WhatsApp',
  description: 'Supervisa tu bot de ventas, aprueba cotizaciones y cierra ventas',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
