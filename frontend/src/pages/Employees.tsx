import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../services/api'
import { DEPARTMENTS, COUNTRIES } from '../lib/constants'
import EmployeeFormModal from '../components/EmployeeFormModal'
import ImportModal from '../components/ImportModal'

// Stable, accessible-ish color per department (identity, not magnitude).
const deptColors: Record<string, string> = {
  Engineering: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Sales: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  HR: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20',
  Finance: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Marketing: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  Operations: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  Legal: 'bg-rose-50 text-rose-700 ring-rose-600/20'
}

const avatarColors = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-fuchsia-500 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600'
]
const avatarFor = (seed: string) =>
  avatarColors[(seed?.charCodeAt(0) ?? 0) % avatarColors.length]

export default function Employees() {
  const qc = useQueryClient()
  const [filters, setFilters] = useState({
    search: '', department: '', country: '', status: '',
    minSalary: '', maxSalary: '', cursor: ''
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [importOpen, setImportOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeApi.getAll({
      ...filters,
      minSalary: filters.minSalary || undefined,
      maxSalary: filters.maxSalary || undefined,
      status: filters.status || undefined,
      cursor: filters.cursor || undefined
    }).then(r => r.data)
  })

  const deactivate = useMutation({
    mutationFn: (id: string) => employeeApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      qc.invalidateQueries({ queryKey: ['summary'] })
    }
  })

  const updateFilter = (key: string, value: string) => {
    setFilters(f => ({ ...f, [key]: value, cursor: '' }))
  }

  const clearFilters = () => {
    setFilters({ search: '', department: '', country: '', status: '', minSalary: '', maxSalary: '', cursor: '' })
  }

  const hasFilters = Boolean(
    filters.search || filters.department || filters.country || filters.status || filters.minSalary || filters.maxSalary
  )

  const openAdd = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (emp: any) => { setEditing(emp); setFormOpen(true) }

  const inputCls =
    'rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="space-y-6">
      {/* Gradient header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-8 py-8 shadow-lg">
        <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Employees</h1>
            <p className="mt-1.5 text-blue-100">Manage and search employee salary records</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setImportOpen(true)}
              className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              Import CSV
            </button>
            <button
              onClick={openAdd}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-blue-50"
            >
              + Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <input
            placeholder="Search name or ID…"
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className={`col-span-2 ${inputCls}`}
          />
          <select value={filters.department} onChange={e => updateFilter('department', e.target.value)} className={`${inputCls} text-slate-600`}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={filters.country} onChange={e => updateFilter('country', e.target.value)} className={`${inputCls} text-slate-600`}>
            <option value="">All Countries</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filters.status} onChange={e => updateFilter('status', e.target.value)} className={`${inputCls} text-slate-600`}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <input placeholder="Min salary" type="number" value={filters.minSalary} onChange={e => updateFilter('minSalary', e.target.value)} className={inputCls} />
          <input placeholder="Max salary" type="number" value={filters.maxSalary} onChange={e => updateFilter('maxSalary', e.target.value)} className={inputCls} />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                {['Employee', 'ID', 'Department', 'Country', 'Base Salary', 'Status', ''].map((h, i) => (
                  <th key={i} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2.5">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      Loading employees…
                    </div>
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    No employees found matching your filters
                  </td>
                </tr>
              ) : (
                data?.data?.map((emp: any) => (
                  <tr key={emp.id} className="group transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${avatarFor(emp.firstName)}`}>
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <p className="truncate font-semibold text-slate-900">{emp.firstName} {emp.lastName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{emp.employeeId}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${deptColors[emp.department] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20'}`}>
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{emp.country}</td>
                    <td className="px-5 py-3">
                      <span className="font-bold tabular-nums text-slate-900">
                        {emp.baseSalary.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="ml-1.5 text-xs font-medium text-slate-400">{emp.currency}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEdit(emp)}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                        >
                          Edit
                        </button>
                        {emp.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              if (confirm(`Deactivate ${emp.firstName} ${emp.lastName}?`)) deactivate.mutate(emp.id)
                            }}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
          <p className="text-sm text-slate-400">
            Showing <span className="font-semibold text-slate-600">{data?.data?.length ?? 0}</span> employees
            {data?.hasMore ? ' — more available' : ''}
          </p>
          {data?.hasMore && (
            <button
              onClick={() => setFilters(f => ({ ...f, cursor: data.nextCursor }))}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Load more →
            </button>
          )}
        </div>
      </div>

      <EmployeeFormModal open={formOpen} onClose={() => setFormOpen(false)} employee={editing} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
