import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'  // shadcn si usas

const metrics = [
  { title: 'Ventas', value: '$1.200', change: '+12%' },
  { title: 'Chats', value: '12', change: '+2' },
  { title: 'Tasa cierre', value: '25%', change: '+5%' }
]

export default function Metrics() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {metrics.map((metric, i) => (
        <Card key={i} className="shadow-sm border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <p className="text-sm text-green-600 mt-1">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
