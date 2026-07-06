import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { employeeApi } from '../services/api'

const departments = ['Engineering', 'Sales', 'HR', 'Finance', 'Marketing', 'Operations', 'Legal']
const countries = ['US', 'UK', 'India', 'Germany', 'France', 'Canada', 'Australia']

export default function Employees() {
  const [filters, setFilters] = useState({
    search: '', department: '', country: '',
    minSalary: '', maxSalary: '', cursor: ''
  })

  const { data, isLoading } = useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeApi.getAll({
      ...filters,
      minSalary: filters.minSalary || undefined,
      maxSalary: filters.maxSalary || undefined,
      cursor: filters.cursor || undefined
    }).then(r => r.data)
  })

  const updateFilter = (key: string, value: string) => {
    setFilters(f => ({ ...f, [key]: value, cursor: '' }))
  }

  const clearFilters = () => {
    setFilters({ search: '', department: '', country: '', minSalary: '', maxSalary: '', cursor: '' })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-500 mt-1">Manage and search employee salary records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-6 gap-3">
          <input
            placeholder="Search name or ID..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.department}
            onChange={e => updateFilter('department', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
          <select
            value={filters.country}
            onChange={e => updateFilter('country', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            placeholder="Min salary"
            type="number"
            value={filters.minSalary}
            onChange={e => updateFilter('minSalary', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Max salary"
            type="number"
            value={filters.maxSalary}
            onChange={e => updateFilter('maxSalary', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {(filters.search || filters.department || filters.country || filters.minSalary || filters.maxSalary) && (
          <button
            onClick={clearFilters}
            className="mt-3 text-xs text-blue-600 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Employee ID', 'Name', 'Department', 'Country', 'Currency', 'Base Salary', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading employees...
                  </div>
                </td>
              </tr>
            ) : data?.data?.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  No employees found matching your filters
                </td>
              </tr>
            ) : (
              data?.data?.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{emp.employeeId}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{emp.department}</td>
                  <td className="px-5 py-3.5 text-gray-600">{emp.country}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {emp.currency}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    {emp.baseSalary.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      emp.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {data?.data?.length ?? 0} employees
            {data?.hasMore ? ' — more available' : ''}
          </p>
          {data?.hasMore && (
            <button
              onClick={() => setFilters(f => ({ ...f, cursor: data.nextCursor }))}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Load more →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}