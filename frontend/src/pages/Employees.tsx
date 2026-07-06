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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Employees</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 grid grid-cols-5 gap-3">
        <input
          placeholder="Search name or ID..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
          className="border rounded px-3 py-2 text-sm col-span-2"
        />
        <select
          value={filters.department}
          onChange={e => updateFilter('department', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select
          value={filters.country}
          onChange={e => updateFilter('country', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Countries</option>
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setFilters({
            search: '', department: '', country: '',
            minSalary: '', maxSalary: '', cursor: ''
          })}
          className="border rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
        >
          Clear
        </button>
        <input
          placeholder="Min salary"
          type="number"
          value={filters.minSalary}
          onChange={e => updateFilter('minSalary', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          placeholder="Max salary"
          type="number"
          value={filters.maxSalary}
          onChange={e => updateFilter('maxSalary', e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['ID', 'Name', 'Department', 'Country', 'Currency', 'Base Salary', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : data?.data?.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No employees found
                </td>
              </tr>
            ) : (
              data?.data?.map((emp: any) => (
                <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{emp.employeeId}</td>
                  <td className="px-4 py-3 font-medium">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-3">{emp.department}</td>
                  <td className="px-4 py-3">{emp.country}</td>
                  <td className="px-4 py-3">{emp.currency}</td>
                  <td className="px-4 py-3">
                    {emp.baseSalary.toLocaleString('en-US', {
                      maximumFractionDigits: 0
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
        {data?.hasMore && (
          <div className="p-4 border-t">
            <button
              onClick={() => setFilters(f => ({ ...f, cursor: data.nextCursor }))}
              className="text-sm text-blue-600 hover:underline"
            >
              Load more
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400">
        Showing {data?.data?.length ?? 0} employees
        {data?.hasMore ? ' — more available' : ''}
      </p>
    </div>
  )
}