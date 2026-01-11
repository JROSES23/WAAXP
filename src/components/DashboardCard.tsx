import Link from 'next/link'

interface DashboardCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle?: string
  change?: string
  color?: 'teal' | 'green' | 'blue' | 'orange' | 'red'
  link?: string
}

export default function DashboardCard({
  icon,
  title,
  value,
  subtitle,
  change,
  color = 'teal',
  link
}: DashboardCardProps) {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-700',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
  }

  const content = (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-bold text-gray-900">{value}</h3>
          {change && (
            <span className="text-sm text-green-600 font-medium">{change}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      
      {link && (
        <button className="mt-4 text-sm text-teal-700 font-medium hover:underline">
          Ir a Inbox →
        </button>
      )}
    </div>
  )

  return link ? <Link href={link}>{content}</Link> : content
}
