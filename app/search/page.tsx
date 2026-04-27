'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { searchUsers } from '@/services/user'
import { GetUserResponse } from '@/types/user.types'

const STORAGE_KEY = 'user-search-history'
const MAX_HISTORY = 3

function getStoredHistory(): string[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveToHistory(query: string) {
  if (!query.trim()) return
  const history = getStoredHistory()
  const filtered = history.filter((q) => q !== query)
  const updated = [query, ...filtered].slice(0, MAX_HISTORY)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GetUserResponse[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true)
    setSearchHistory(getStoredHistory())
  }, [])

  useEffect(() => {
    if (!hasSearched && query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasSearched(true)
      startTransition(async () => {
        const response = await searchUsers(query)
        if (response.success) {
          setResults(response.data)
        } else {
          setError(response.error)
        }
      })
    }
  }, [query, hasSearched])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setError('')
    saveToHistory(query)
    setSearchHistory(getStoredHistory())
    startTransition(async () => {
      const response = await searchUsers(query)
      if (response.success) {
        setResults(response.data)
      } else {
        setError(response.error)
        setResults([])
      }
    })
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    setError('')
    setHasSearched(false)
  }

  const handleUserSelect = (userId: string) => {
    router.push(`/userDetails/${userId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">User Search</h1>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isPending || !query.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {isHydrated && searchHistory.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((historyQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(historyQuery)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  {historyQuery}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {results.length === 0 && query && !isPending && !error && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No users found</p>
          )}

          {results.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user.id)}
              className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {user.phone && (
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                      📞 {user.phone}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                    🌎 {user.country}
                  </span>
                  {user.identityProviderId && (
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                      🔐 {user.identityProviderId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
