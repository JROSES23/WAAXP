import { ReactNode } from "react"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const meta: Record<string, { title: string; description: string }> = {
    "automatizar-ventas-whatsapp-chile": {
      title: "Cómo automatizar ventas en WhatsApp en Chile | WAAXP",
      description:
        "Guía práctica para PYMEs chilenas que quieren vender más automatizando WhatsApp Business con IA.",
    },
    "errores-whatsapp-business": {
      title: "5 errores en Whatsapp Business que te cuestan ventas | WAAXP",
      description:
        "Errores comunes que hacen perder clientes y cómo evitarlos usando automatización.",
    },
    "roi-automatizacion-whatsapp": {
      title: "ROI de automatizar WhatsApp | Casos reales en Chile",
      description:
        "Casos reales de PYMEs chilenas que aumentaron ventas usando WhatsApp con IA.",
    },
  }

  return meta[slug] ?? {
    title: "Blog | WAAXP",
    description:
      "Guías y estrategias para vender más con WhatsApp Business e IA.",
  }
}

export default function BlogSlugLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
