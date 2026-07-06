import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-0 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 py-4">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <span className="font-bold text-gray-900">ACME Salary</span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/employees', label: 'Employees' }
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-5 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Logout
        </button>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}