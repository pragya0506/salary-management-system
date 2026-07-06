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

  const fmt = (n: number) => n?.toLocaleString('en-US', {
    maximumFractionDigits: 0
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: fmt(summary?.totalEmployees) },
          { label: 'Average Salary', value: `$${fmt(summary?.averageSalary)}` },
          { label: 'Min Salary', value: `$${fmt(summary?.minSalary)}` },
          { label: 'Max Salary', value: `$${fmt(summary?.maxSalary)}` }
        ].map(card => (
          <div key={card.label} className="bg-white rounded-lg p-5 shadow-sm border">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {card.value ?? '...'}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* By Department */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <h2 className="font-semibold text-gray-700 mb-4">By Department</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Department</th>
                <th className="pb-2">Headcount</th>
                <th className="pb-2">Avg Salary</th>
              </tr>
            </thead>
            <tbody>
              {byDept?.map((row: any) => (
                <tr key={row.department} className="border-b last:border-0">
                  <td className="py-2">{row.department}</td>
                  <td className="py-2">{row._count.id}</td>
                  <td className="py-2">${fmt(row._avg.baseSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* By Country */}
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <h2 className="font-semibold text-gray-700 mb-4">By Country</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Country</th>
                <th className="pb-2">Currency</th>
                <th className="pb-2">Headcount</th>
                <th className="pb-2">Avg Salary</th>
              </tr>
            </thead>
            <tbody>
              {byCountry?.map((row: any) => (
                <tr key={row.country} className="border-b last:border-0">
                  <td className="py-2">{row.country}</td>
                  <td className="py-2">{row.currency}</td>
                  <td className="py-2">{row._count.id}</td>
                  <td className="py-2">{fmt(row._avg.baseSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}