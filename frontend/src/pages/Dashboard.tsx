import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../services/api'

export default function Dashboard() {
  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: () => analyticsApi.getSummary().then(r => r.data)
  })

  const { data: byDept } = useQuery({
    queryKey: ['byDepartment'],
    queryFn: () => analyticsApi.getByDepartment().then(r => r.data)
  })

  const { data: byCountry } = useQuery({
    queryKey: ['byCountry'],
    queryFn: () => analyticsApi.getByCountry().then(r => r.data)
  })

  const fmt = (n: number) =>
    n?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '...'

  const summaryCards = [
    {
      label: 'Total Employees',
      value: fmt(summary?.totalEmployees),
      color: 'bg-blue-50 text-blue-700',
      icon: '👥'
    },
    {
      label: 'Average Salary',
      value: `$${fmt(summary?.averageSalary)}`,
      color: 'bg-green-50 text-green-700',
      icon: '💰'
    },
    {
      label: 'Min Salary',
      value: `$${fmt(summary?.minSalary)}`,
      color: 'bg-yellow-50 text-yellow-700',
      icon: '📉'
    },
    {
      label: 'Max Salary',
      value: `$${fmt(summary?.maxSalary)}`,
      color: 'bg-purple-50 text-purple-700',
      icon: '📈'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Salary overview across ACME organization</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.color} text-lg mb-3`}>
              {card.icon}
            </div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* By Department */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">By Department</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Headcount</th>
                  <th className="pb-3">Avg Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {byDept?.map((row: any) => (
                  <tr key={row.department}>
                    <td className="py-3 font-medium text-gray-800">{row.department}</td>
                    <td className="py-3 text-gray-500">{row._count.id.toLocaleString()}</td>
                    <td className="py-3 text-gray-800">${fmt(row._avg.baseSalary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Country */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">By Country</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="pb-3">Country</th>
                  <th className="pb-3">Currency</th>
                  <th className="pb-3">Headcount</th>
                  <th className="pb-3">Avg Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {byCountry?.map((row: any) => (
                  <tr key={row.country}>
                    <td className="py-3 font-medium text-gray-800">{row.country}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {row.currency}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{row._count.id.toLocaleString()}</td>
                    <td className="py-3 text-gray-800">{fmt(row._avg.baseSalary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}