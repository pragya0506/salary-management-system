export const useAuth = () => {
  const token = localStorage.getItem('token')

  const login = (token: string) => {
    localStorage.setItem('token', token)
    window.location.href = '/dashboard'
  }

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return { token, login, logout }
}