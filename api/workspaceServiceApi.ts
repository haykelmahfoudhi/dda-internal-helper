import {
  AdminCreateAccessTokenResponse,
  AdminGetAccessTokensResponse,
  GetUserWorkspaceResponse,
} from '@/types/workspace.types'
import workspaceServiceConnector from './workspaceServiceConnector'

export const workspaceApi = {
  async getUserById(workspaceId: string, userId: string): Promise<GetUserWorkspaceResponse> {
    try {
      return await workspaceServiceConnector.get(
        `/api/v1/admin/workspace/${workspaceId}/user/${userId}`
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user'
      throw new Error(message)
    }
  },
  async getWorkspacesByUserId(userId: string): Promise<GetUserWorkspaceResponse[]> {
    try {
      return await workspaceServiceConnector.get(`/api/v1/admin/workspaces/user/${userId}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user workspaces'
      throw new Error(message)
    }
  },

  // ----------- Access-token related API calls -----------

  async getAccessToken(workspaceId: string): Promise<AdminGetAccessTokensResponse[]> {
    try {
      return await workspaceServiceConnector.get(
        `/api/v1/admin/workspaces/${workspaceId}/access-tokens`
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch access token'
      throw new Error(message)
    }
  },

  async createAccessToken(
    userId: string,
    workspaceId: string,
    label: string,
    permissions: string[],
    expiresAt: Date
  ): Promise<AdminCreateAccessTokenResponse> {
    try {
      return await workspaceServiceConnector.post(
        `/api/v1/admin/workspaces/${workspaceId}/access-tokens`,
        {
          userId,
          label,
          permissions,
          expiresAt,
        }
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create access token'
      throw new Error(message)
    }
  },

  async revokeAccessToken(workspaceId: string, tokenId: string): Promise<void> {
    try {
      await workspaceServiceConnector.post(
        `/api/v1/admin/workspaces/${workspaceId}/access-tokens/${tokenId}/revoke`,
        {}
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to revoke access token'
      throw new Error(message)
    }
  },

  async deleteAccessToken(workspaceId: string, tokenId: string): Promise<void> {
    try {
      await workspaceServiceConnector.delete(
        `/api/v1/admin/workspaces/${workspaceId}/access-tokens/${tokenId}`
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete access token'
      throw new Error(message)
    }
  },

  async rotateAccessToken(
    workspaceId: string,
    tokenId: string,
    userId: string,
    expiresAt?: Date
  ): Promise<AdminCreateAccessTokenResponse> {
    try {
      return await workspaceServiceConnector.post(
        `/api/v1/admin/workspaces/${workspaceId}/access-tokens/${tokenId}/regenerate`,
        {
          userId,
          expiresAt,
        }
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to rotate access token'
      throw new Error(message)
    }
  },
}
