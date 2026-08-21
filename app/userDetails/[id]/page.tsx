'use client'

import { useState, useTransition, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Copy, Mail, RotateCw, Trash2, Key, Calendar, X, Check } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { getUserById, getUserMemberships } from '@/services/user'
import {
  getUserWorkspaces,
  getAccessToken,
  createAccessToken,
  revokeAccessToken,
  deleteAccessToken,
  rotateAccessToken,
} from '@/services/workspace'
import { getUserApiKeys, createApiKey, revokeApiKey, rotateApiKey } from '@/services/apiKey'
import { GetUserResponse, MembershipResponse, MembershipRole } from '@/types/user.types'
import {
  GetUserWorkspaceResponse,
  AdminCreateAccessTokenResponse,
  AdminGetAccessTokensResponse,
} from '@/types/workspace.types'
import { ApiKeyResponseType } from '@/types/authentication.types'
import { WorkspacePermissions } from '@/types/permissions.type'

type Tab = 'info' | 'membership' | 'workspaces' | 'apiKeys'

type NewKeyModalProps = {
  isOpen: boolean
  newKey: string | null
  onClose: () => void
  onCopy: () => void
  onSendEmail: () => void
}

function NewKeyModal({ isOpen, newKey, onClose, onCopy, onSendEmail }: NewKeyModalProps) {
  if (!isOpen || !newKey) return null

  const tokenObj = {
    access_token: newKey,
    token_type: 'Bearer',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Access Token Created
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          This is your new access token. It will not be shown again, so make sure to copy it now.
        </p>
        <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-lg mb-4 overflow-x-auto">
          <pre className="text-sm text-green-400 dark:text-green-300 font-mono whitespace-pre-wrap break-all">
            {JSON.stringify(tokenObj, null, 4)}
          </pre>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy to Clipboard
          </button>
          <button
            onClick={onSendEmail}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            Send via Email
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default function UserDetailsPage() {
  const params = useParams()
  const userId = params.id as string
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [user, setUser] = useState<GetUserResponse | null>(null)
  const [memberships, setMemberships] = useState<MembershipResponse[]>([])
  const [workspaces, setWorkspaces] = useState<GetUserWorkspaceResponse[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyResponseType[]>([])
  const [isPending, startTransition] = useTransition()
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(false)
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false)
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false)
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<GetUserWorkspaceResponse | null>(null)
  const [workspaceTokens, setWorkspaceTokens] = useState<AdminGetAccessTokensResponse[]>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)
  const [showCreateTokenModal, setShowCreateTokenModal] = useState(false)
  const [showNewTokenModal, setShowNewTokenModal] = useState(false)
  const [newTokenData, setNewTokenData] = useState<AdminCreateAccessTokenResponse | null>(null)
  const [isCreatingToken, setIsCreatingToken] = useState(false)
  const [tokenActionLoading, setTokenActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    startTransition(async () => {
      const response = await getUserById(userId)
      if (response.success) {
        setUser(response.data)
        setError('')
      } else {
        setError(response.error)
        setUser(null)
      }
    })
  }, [userId])

  useEffect(() => {
    if (activeTab === 'membership' && memberships.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoadingMemberships(true)
      startTransition(async () => {
        const response = await getUserMemberships(userId)
        if (response.success) {
          setMemberships(response.data)
        } else {
          setError(response.error)
        }
        setIsLoadingMemberships(false)
      })
    }
  }, [activeTab, userId, memberships.length])

  useEffect(() => {
    if (activeTab === 'workspaces' && workspaces.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoadingWorkspaces(true)
      startTransition(async () => {
        const response = await getUserWorkspaces(userId)
        if (response.success) {
          setWorkspaces(response.data)
        } else {
          setError(response.error)
        }
        setIsLoadingWorkspaces(false)
      })
    }
  }, [activeTab, userId, workspaces.length])

  useEffect(() => {
    if (activeTab === 'apiKeys' && apiKeys.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoadingApiKeys(true)
      startTransition(async () => {
        const response = await getUserApiKeys(userId)
        if (response.success) {
          setApiKeys(response.data)
        } else {
          setError(response.error)
        }
        setIsLoadingApiKeys(false)
      })
    }
  }, [activeTab, userId, apiKeys.length])

  const handleCreateApiKey = async (description: string, expiresAt?: string) => {
    setIsCreatingKey(true)
    const response = await createApiKey(userId, description, expiresAt)
    if (response.success) {
      setNewApiKey(response.data.key)
      setShowNewKeyModal(true)
      const keysResponse = await getUserApiKeys(userId)
      if (keysResponse.success) {
        setApiKeys(keysResponse.data)
      }
    } else {
      setError(response.error)
    }
    setIsCreatingKey(false)
  }

  const handleRevokeApiKey = async (apiKeyId: string) => {
    startTransition(async () => {
      const response = await revokeApiKey(apiKeyId)
      if (response.success) {
        const keysResponse = await getUserApiKeys(userId)
        if (keysResponse.success) {
          setApiKeys(keysResponse.data)
        }
      } else {
        setError(response.error)
      }
    })
  }

  const handleRotateApiKey = async (apiKeyId: string) => {
    startTransition(async () => {
      const response = await rotateApiKey(apiKeyId)
      if (response.success) {
        setNewApiKey(response.data.key)
        setShowNewKeyModal(true)
        const keysResponse = await getUserApiKeys(userId)
        if (keysResponse.success) {
          setApiKeys(keysResponse.data)
        }
      } else {
        setError(response.error)
      }
    })
  }

  const handleCopyKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey)
      toast.success('API key copied to clipboard')
    }
  }

  const handleSendEmail = () => {
    // TODO: Implement email sending
    setShowNewKeyModal(false)
  }

  const handleWorkspaceClick = async (workspace: GetUserWorkspaceResponse) => {
    setSelectedWorkspace(workspace)
    setIsLoadingTokens(true)
    setWorkspaceTokens([])
    const response = await getAccessToken(workspace.id)
    if (response.success) {
      setWorkspaceTokens(response.data)
    } else {
      setError(response.error)
    }
    setIsLoadingTokens(false)
  }

  const handleCloseWorkspaceModal = () => {
    setSelectedWorkspace(null)
    setWorkspaceTokens([])
  }

  const handleCreateToken = async (label: string, permissions: string[], expiresAt: string) => {
    if (!selectedWorkspace || !user) return
    setIsCreatingToken(true)
    const response = await createAccessToken(
      user.id,
      selectedWorkspace.id,
      label,
      permissions,
      new Date(expiresAt)
    )
    if (response.success) {
      setNewTokenData(response.data)
      setShowNewTokenModal(true)
      setShowCreateTokenModal(false)
      const tokensResponse = await getAccessToken(selectedWorkspace.id)
      if (tokensResponse.success) {
        setWorkspaceTokens(tokensResponse.data)
      }
    } else {
      setError(response.error)
    }
    setIsCreatingToken(false)
  }

  const handleRotateToken = async (tokenId: string) => {
    if (!selectedWorkspace || !user) return
    setTokenActionLoading(tokenId)
    const response = await rotateAccessToken(selectedWorkspace.id, tokenId, user.id)
    if (response.success) {
      setNewTokenData(response.data as AdminCreateAccessTokenResponse)
      setShowNewTokenModal(true)
      const tokensResponse = await getAccessToken(selectedWorkspace.id)
      if (tokensResponse.success) {
        setWorkspaceTokens(tokensResponse.data)
      }
    } else {
      setError(response.error)
    }
    setTokenActionLoading(null)
  }

  const handleRevokeToken = async (tokenId: string) => {
    if (!selectedWorkspace) return
    setTokenActionLoading(tokenId)
    const response = await revokeAccessToken(selectedWorkspace.id, tokenId)
    if (response.success) {
      const tokensResponse = await getAccessToken(selectedWorkspace.id)
      if (tokensResponse.success) {
        setWorkspaceTokens(tokensResponse.data)
      }
    } else {
      setError(response.error)
    }
    setTokenActionLoading(null)
  }

  const handleDeleteToken = async (tokenId: string) => {
    if (!selectedWorkspace) return
    setTokenActionLoading(tokenId)
    const response = await deleteAccessToken(selectedWorkspace.id, tokenId)
    if (response.success) {
      const tokensResponse = await getAccessToken(selectedWorkspace.id)
      if (tokensResponse.success) {
        setWorkspaceTokens(tokensResponse.data)
      }
    } else {
      setError(response.error)
    }
    setTokenActionLoading(null)
  }

  const handleCopyToken = () => {
    if (newTokenData?.token?.access_token) {
      const tokenObj = {
        access_token: newTokenData.token.access_token,
        token_type: newTokenData.token.token_type || 'Bearer',
      }
      navigator.clipboard.writeText(JSON.stringify(tokenObj, null, 2))
      toast.success('Access token copied to clipboard')
    }
  }

  const handleSendTokenEmail = () => {
    // TODO: Implement email sending
    setShowNewTokenModal(false)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'User Info' },
    { id: 'membership', label: 'Membership' },
    { id: 'workspaces', label: 'Workspaces' },
    { id: 'apiKeys', label: 'API Keys' },
  ]

  const getRoleBadgeClass = (role: MembershipRole) => {
    switch (role) {
      case MembershipRole.OWNER:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case MembershipRole.ADMIN:
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case MembershipRole.MANAGER:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case MembershipRole.MEMBER:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case MembershipRole.VIEWER:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Toaster position="top-right" />
      <div className="flex">
        <nav className="w-64 min-h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6">
          <Link
            href="/search"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
          >
            ← Back to Search
          </Link>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Navigation</h2>

          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-8">
          {isPending && !user && (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
          )}

          {error && (
            <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {activeTab === 'info' && user && (
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                User Information
              </h1>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {user.email}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">{user.id}</p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : user.status === 'suspended'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoCard label="User ID" value={user.id} />
                  <InfoCard label="Email" value={user.email} />
                  <InfoCard label="Identity Provider" value={user.identityProvider} />
                  <InfoCard label="Identity Provider ID" value={user.identityProviderId} />
                  <InfoCard label="Status" value={user.status} />
                  <InfoCard
                    label="Created At"
                    value={new Date(user.createdAt).toLocaleString()}
                  />
                  <InfoCard
                    label="Updated At"
                    value={new Date(user.updatedAt).toLocaleString()}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'membership' && (
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                User Membership
              </h1>

              {isLoadingMemberships ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-slate-500 dark:text-slate-400">Loading memberships...</div>
                </div>
              ) : memberships.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <p className="text-slate-500 dark:text-slate-400">No memberships found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {memberships.map((membership) => (
                    <div
                      key={membership.id}
                      className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            Workspace ID: {membership.workspaceId}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Region: {membership.region}
                          </p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(membership.role)}`}
                          >
                            {membership.role}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Joined: {new Date(membership.joinedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'workspaces' && (
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                User Workspaces
              </h1>

              {isLoadingWorkspaces ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-slate-500 dark:text-slate-400">Loading workspaces...</div>
                </div>
              ) : workspaces.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <p className="text-slate-500 dark:text-slate-400">No workspaces found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {workspaces.map((workspace) => {
                    const membership = workspace.membership
                    return (
                      <div
key={workspace.id}
              onClick={() => handleWorkspaceClick(workspace)}
                        className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {workspace.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Region: {workspace.region}
                            </p>
                          </div>
                          <div className="flex flex-col sm:items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                workspace.status === 'active'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : workspace.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {workspace.status}
                            </span>
                            {membership && (
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(membership.role)}`}
                              >
                                {membership.role}
                              </span>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Created: {new Date(workspace.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'apiKeys' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">API Keys</h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create API Key
                </button>
              </div>

              {isLoadingApiKeys ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-slate-500 dark:text-slate-400">Loading API keys...</div>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <p className="text-slate-500 dark:text-slate-400">No API keys found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <Key className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {apiKey.description}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                              {apiKey.keyPrefix}...
                            </p>
                            {apiKey.expiresAt && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          {apiKey.revokedAt ? (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              Revoked
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Active
                            </span>
                          )}
                          <div className="flex gap-2">
                            {!apiKey.revokedAt && (
                              <>
                                <button
                                  onClick={() => handleRotateApiKey(apiKey.id)}
                                  title="Rotate API Key"
                                  className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                                >
                                  <RotateCw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRevokeApiKey(apiKey.id)}
                                  title="Revoke API Key"
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreateApiKeyModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateApiKey}
          isLoading={isCreatingKey}
        />
      )}

      <NewKeyModal
        isOpen={showNewKeyModal}
        newKey={newApiKey}
        onClose={() => {
          setShowNewKeyModal(false)
          setNewApiKey(null)
        }}
        onCopy={handleCopyKey}
        onSendEmail={handleSendEmail}
      />

      {selectedWorkspace && (
        <WorkspaceAccessTokenModal
          workspace={selectedWorkspace}
          tokens={workspaceTokens}
          isLoading={isLoadingTokens}
          onClose={handleCloseWorkspaceModal}
          onCreateNew={() => setShowCreateTokenModal(true)}
          onRotate={handleRotateToken}
          onRevoke={handleRevokeToken}
          onDelete={handleDeleteToken}
          actionLoading={tokenActionLoading}
        />
      )}

      {showCreateTokenModal && selectedWorkspace && (
        <CreateTokenModal
          onClose={() => setShowCreateTokenModal(false)}
          onSubmit={handleCreateToken}
          isLoading={isCreatingToken}
        />
      )}

      <NewKeyModal
        isOpen={showNewTokenModal}
        newKey={newTokenData?.token?.access_token || null}
        onClose={() => {
          setShowNewTokenModal(false)
          setNewTokenData(null)
        }}
        onCopy={handleCopyToken}
        onSendEmail={handleSendTokenEmail}
      />
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className="text-slate-900 dark:text-white font-medium break-all">{value}</div>
    </div>
  )
}

type CreateApiKeyModalProps = {
  onClose: () => void
  onSubmit: (description: string, expiresAt?: string) => Promise<void>
  isLoading: boolean
}

function CreateApiKeyModal({ onClose, onSubmit, isLoading }: CreateApiKeyModalProps) {
  const [description, setDescription] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    await onSubmit(description, expiresAt || undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create API Key</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Production API Key"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expires At (Optional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type WorkspaceAccessTokenModalProps = {
  workspace: GetUserWorkspaceResponse
  tokens: AdminGetAccessTokensResponse[]
  isLoading: boolean
  onClose: () => void
  onCreateNew: () => void
  onRotate: (tokenId: string) => Promise<void>
  onRevoke: (tokenId: string) => Promise<void>
  onDelete: (tokenId: string) => Promise<void>
  actionLoading: string | null
}

function WorkspaceAccessTokenModal({
  workspace,
  tokens,
  isLoading,
  onClose,
  onCreateNew,
  onRotate,
  onRevoke,
  onDelete,
  actionLoading,
}: WorkspaceAccessTokenModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{workspace.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {workspace.region}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Access Token
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-slate-500 dark:text-slate-400">Loading access tokens...</div>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No access tokens found
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div key={token.tokenId} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {token.label}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          token.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {token.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Token ID: <code className="text-xs">{token.tokenId}</code>
                    </p>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {token.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded text-xs"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Expires: {new Date(token.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {token.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => onRotate(token.tokenId)}
                          disabled={actionLoading === token.tokenId}
                          title="Rotate Token"
                          className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRevoke(token.tokenId)}
                          disabled={actionLoading === token.tokenId}
                          title="Revoke Token"
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(token.tokenId)}
                      disabled={actionLoading === token.tokenId}
                      title="Delete Token"
                      className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type CreateTokenModalProps = {
  onClose: () => void
  onSubmit: (label: string, permissions: string[], expiresAt: string) => Promise<void>
  isLoading: boolean
}

function CreateTokenModal({ onClose, onSubmit, isLoading }: CreateTokenModalProps) {
  const [label, setLabel] = useState('')
  const [permissions, setPermissions] = useState<string[]>([])
  const [expiresAt, setExpiresAt] = useState('')

  const permissionOptions = Object.values(WorkspacePermissions)

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim() || permissions.length === 0 || !expiresAt) return
    await onSubmit(label, permissions, expiresAt)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Access Token</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Production Token"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">
              Permissions
            </label>
            <div className="flex flex-wrap gap-2">
              {permissionOptions.map((perm) => (
                <button
                  key={perm}
                  type="button"
                  onClick={() => togglePermission(perm)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    permissions.includes(perm)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {perm}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expires At
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !label.trim() || permissions.length === 0 || !expiresAt}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
