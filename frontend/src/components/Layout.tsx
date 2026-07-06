import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-800 text-lg">
            ACME Salary Manager
          </span>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`
            }
          >
            Employees
          </NavLink>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Logout
        </button>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}