export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        <div className="hidden md:block w-64 bg-white border-r border-slate-200 min-h-screen" />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-white/70 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-28 bg-white rounded-2xl" />
              <div className="h-28 bg-white rounded-2xl" />
              <div className="h-28 bg-white rounded-2xl" />
            </div>
            <div className="h-72 bg-white rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
