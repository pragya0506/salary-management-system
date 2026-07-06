import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../services/api'

const fmt = (n?: number) =>
  n?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '—'

const fmtCompact = (n?: number) =>
  n === undefined
    ? '—'
    : n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })

// Horizontal magnitude bars — single blue hue, rounded ends, direct labels,
// recessive track. Sorted descending so the ranking reads top-to-bottom.
function BarChart({
  rows,
  valuePrefix = ''
}: {
  rows: { label: string; value: number; sub?: string }[]
  valuePrefix?: string
}) {
  const max = Math.max(...rows.map(r => r.value), 1)
  return (
    <div className="space-y-3.5">
      {rows.map((row, i) => (
        <div key={row.label} className="group">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-semibold text-slate-700">{row.label}</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {valuePrefix}
              {fmt(row.value)}
              {row.sub && (
                <span className="ml-2 text-xs font-medium text-slate-400">{row.sub}</span>
              )}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out group-hover:from-blue-400 group-hover:to-indigo-500"
              style={{ width: `${Math.max((row.value / max) * 100, 2)}%`, transitionDelay: `${i * 40}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function StatCard({
  label,
  value,
  gradient,
  icon
}: {
  label: string
  value: string
  gradient: string
  icon: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-xl ${gradient}`} />
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl shadow-sm ${gradient}`}>
        <span className="drop-shadow-sm">{icon}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
    </div>
  )
}

function CardShell({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

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

  const summaryCards = [
    { label: 'Total Employees', value: fmt(summary?.totalEmployees), gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white', icon: '👥' },
    { label: 'Average Salary', value: `$${fmtCompact(summary?.averageSalary)}`, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white', icon: '💰' },
    { label: 'Min Salary', value: `$${fmtCompact(summary?.minSalary)}`, gradient: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white', icon: '📉' },
    { label: 'Max Salary', value: `$${fmtCompact(summary?.maxSalary)}`, gradient: 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white', icon: '📈' }
  ]

  const deptRows = [...(byDept ?? [])]
    .map((r: any) => ({
      label: r.department,
      value: Math.round(r._avg.baseSalary ?? 0),
      sub: `${r._count.id.toLocaleString()} · $${fmtCompact(r._min?.baseSalary)}–$${fmtCompact(r._max?.baseSalary)}`
    }))
    .sort((a, b) => b.value - a.value)

  const countryRows = [...(byCountry ?? [])]
    .map((r: any) => ({ label: `${r.country} · ${r.currency}`, value: Math.round(r._avg.baseSalary ?? 0), sub: `${r._count.id.toLocaleString()} people` }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      {/* Bold gradient hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-8 py-10 shadow-lg">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 text-blue-100">Salary overview across ACME organization</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardShell title="Average Salary by Department" subtitle="Avg salary · headcount and min–max range below each bar">
          {deptRows.length ? (
            <BarChart rows={deptRows} valuePrefix="$" />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
          )}
        </CardShell>

        <CardShell title="Average Salary by Country" subtitle="Local currency · ranked highest to lowest">
          {countryRows.length ? (
            <BarChart rows={countryRows} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
          )}
        </CardShell>
      </div>
    </div>
  )
}
