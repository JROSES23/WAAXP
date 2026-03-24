import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "sonner"
import { Bricolage_Grotesque, DM_Sans, DM_Mono } from "next/font/google"
import { Providers } from "@/components/providers/theme-provider"

/* ─────────────────────────────────────────────
   TIPOGRAFÍA
   Display: Bricolage Grotesque (headlines)
   UI/body: DM Sans (interfaz, párrafos)
   Mono: DM Mono (datos, números, código)
───────────────────────────────────────────── */

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["300", "400", "500"],
})

export const metadata: Metadata = {
  title: "WAAXP — Agente IA para ventas por WhatsApp",
  description:
    "Automatiza tu WhatsApp y vende 24/7 sin contratar vendedores. El asistente IA que atiende, cotiza y cierra ventas por ti.",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-accent="teal"
      className={`${bricolage.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="antialiased" style={{ fontFamily: "var(--font-ui, 'DM Sans'), system-ui, sans-serif" }}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
