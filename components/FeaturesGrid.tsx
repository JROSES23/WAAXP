import { motion } from 'framer-motion'
import { BarChart3, FileText, Inbox, MessageSquare, Package, Users } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function FeaturesGrid() {
  return (
    <section id="caracteristicas" className="py-20 px-6 bg-[#F1FAEE]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-[#2D3748] mb-4">
            Herramientas profesionales diseñadas para equipos de ventas modernos
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Inbox Centralizado',
              desc: 'Gestiona todas las conversaciones de WhatsApp en una interfaz tipo email. Filtra, busca y organiza eficientemente.',
              icon: Inbox,
            },
            {
              title: 'Aprobaciones Inteligentes',
              desc: 'Revisa y aprueba cotizaciones generadas automáticamente por IA antes de enviarlas a los clientes.',
              icon: FileText,
            },
            {
              title: 'Analytics en Tiempo Real',
              desc: 'Métricas de ventas, tasa de conversión y desempeño del bot actualizadas en vivo.',
              icon: BarChart3,
            },
            {
              title: 'Alertas Personalizadas',
              desc: 'Notificaciones automáticas cuando un cliente necesita atención humana o está listo para comprar.',
              icon: MessageSquare,
            },
            {
              title: 'Gestión de Equipo',
              desc: 'Asigna conversaciones a vendedores específicos. Controla permisos y monitorea el desempeño individual.',
              icon: Users,
            },
            {
              title: 'Integraciones Nativas',
              desc: 'Conecta con tu CRM, ERP y herramientas existentes. Sincronización automática de datos.',
              icon: Package,
            },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full bg-white/80 border-slate-200/70 hover:border-[#0ABAB5] hover:shadow-xl transition-all backdrop-blur">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0ABAB5] to-[#A8DADC] rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
