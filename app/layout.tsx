
import "./globals.css";
import type { Metadata } from 'next'

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
