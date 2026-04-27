import {
  ApiKeyCreatedResponseType,
  ApiKeyResponseType,
  CreateApiKeyRequestType,
  ListApiKeysResponseType,
} from '@/types/authentication.types'
import authenticationServiceConnector from './authenticationServiceConnector'

export const authenticationApi = {
  async createApiKey(
    userId: string,
    description: string,
    expiresAt?: string
  ): Promise<ApiKeyCreatedResponseType> {
    const body = {
      userId,
      description,
      ...(expiresAt && { expiresAt }),
    } as CreateApiKeyRequestType

    try {
      return await authenticationServiceConnector.post('/api/v1/admin/api-keys', body)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create API key'
      throw new Error(message)
    }
  },
  async getUserApiKeys(userId: string): Promise<ListApiKeysResponseType> {
    try {
      return await authenticationServiceConnector.get(`/api/v1/admin/api-keys/user/${userId}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get API keys  by user ID'
      throw new Error(message)
    }
  },
  async listApiKeys(): Promise<ListApiKeysResponseType> {
    try {
      return await authenticationServiceConnector.get('/api/v1/admin/api-keys')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to list API keys'
      throw new Error(message)
    }
  },
  async getApiKeyById(apiKeyId: string): Promise<ApiKeyResponseType> {
    try {
      return await authenticationServiceConnector.get(`/api/v1/admin/api-keys/${apiKeyId}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get API key'
      throw new Error(message)
    }
  },
  async revokeApiKey(apiKeyId: string): Promise<void> {
    try {
      await authenticationServiceConnector.delete(`/api/v1/admin/api-keys/${apiKeyId}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to revoke API key'
      throw new Error(message)
    }
  },
  async rotateApiKey(apiKeyId: string): Promise<ApiKeyCreatedResponseType> {
    try {
      return await authenticationServiceConnector.post(
        `/api/v1/admin/api-keys/${apiKeyId}/rotate`,
        {}
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to rotate API key'
      throw new Error(message)
    }
  },
}
