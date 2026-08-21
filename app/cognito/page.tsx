'use client'

import { useState } from 'react'
import Link from 'next/link'
import { listCognitoUsers, createCognitoUser, deleteCognitoUser, loginCognitoUser } from '@/services/cognito'
import { CognitoUser } from '@/types/cognito.types'

export default function CognitoPage() {
  const [users, setUsers] = useState<CognitoUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginResult, setLoginResult] = useState<{ AccessToken: string; IdToken: string } | null>(null)
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [deletingUsername, setDeletingUsername] = useState<string | null>(null)

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Delete user "${username}"?`)) return
    setDeletingUsername(username)
    const response = await deleteCognitoUser(username)
    if (response.success) {
      setUsers((prev) => prev.filter((u) => u.Username !== username))
    } else {
      setError(response.error)
    }
    setDeletingUsername(null)
  }

  const handleListUsers = async () => {
    setIsLoading(true)
    setError('')
    const response = await listCognitoUsers()
    if (response.success) {
      setUsers(response.data.Users || [])
    } else {
      setError(response.error)
    }
    setIsLoading(false)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setCreateError('')
    setCreateSuccess('')
    setIsCreating(true)

    const response = await createCognitoUser({
      email,
      temporaryPassword: password,
    })

    if (response.success) {
      setCreateSuccess(`User ${email} created successfully`)
      setEmail('')
      setPassword('')
    } else {
      setCreateError(response.error)
    }
    setIsCreating(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword.trim()) return
    setLoginError('')
    setLoginResult(null)
    setIsLoggingIn(true)

    const response = await loginCognitoUser(loginEmail.trim(), loginPassword)

    if (response.success) {
      setLoginResult({
        AccessToken: response.data.AccessToken,
        IdToken: response.data.IdToken,
      })
    } else {
      setLoginError(response.error)
    }
    setIsLoggingIn(false)
  }

  const getAttr = (user: CognitoUser, name: string): string =>
    user.Attributes?.find((a) => a.Name === name)?.Value ?? '-'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/search"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ← Back to Search
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Cognito User Interface
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Create User
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Temporary password"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreating || !email.trim() || !password.trim()}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </form>

              {createError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                  {createSuccess}
                </div>
              )}
            </div>

            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Login
              </h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Email / Username
                  </label>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="local-test@example.com"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Test123!"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn || !loginEmail.trim() || !loginPassword.trim()}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {loginError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {loginError}
                </div>
              )}

              {loginResult && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Access Token
                    </label>
                    <div className="relative">
                      <pre className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto max-h-32 overflow-y-auto">
                        {loginResult.AccessToken}
                      </pre>
                      <button
                        onClick={() => navigator.clipboard.writeText(loginResult.AccessToken)}
                        className="absolute top-1 right-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      ID Token
                    </label>
                    <div className="relative">
                      <pre className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto max-h-32 overflow-y-auto">
                        {loginResult.IdToken}
                      </pre>
                      <button
                        onClick={() => navigator.clipboard.writeText(loginResult.IdToken)}
                        className="absolute top-1 right-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Users</h2>
                <button
                  onClick={handleListUsers}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'List Users'}
                </button>
              </div>

              {error && (
                <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {users.length === 0 && !isLoading && !error && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Click &quot;List Users&quot; to fetch Cognito users
                </p>
              )}

              {users.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Username</th>
                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Email</th>
                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Status</th>
                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Enabled</th>
                        <th className="text-left py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">Created</th>
                        <th className="py-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.Username}
                          className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="py-3 px-2 text-slate-900 dark:text-white font-mono text-xs">
                            {user.Username}
                          </td>
                          <td className="py-3 px-2 text-slate-700 dark:text-slate-300">
                            {getAttr(user, 'email')}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.UserStatus === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : user.UserStatus === 'FORCE_CHANGE_PASSWORD'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {user.UserStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.Enabled
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {user.Enabled ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-500 dark:text-slate-400 text-xs">
                            {new Date(user.UserCreateDate).toLocaleString()}
                          </td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => handleDeleteUser(user.Username)}
                              disabled={deletingUsername === user.Username}
                              className="px-2 py-1 text-xs font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded transition-colors disabled:opacity-50"
                            >
                              {deletingUsername === user.Username ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
