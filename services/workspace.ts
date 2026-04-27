'use server'

import { workspaceApi } from '@/api/workspaceServiceApi'
import { withServerAction } from '@/tools/serverActionTools'
import { ServerActionResponse } from '@/types/serverAction.types'
import {
  AdminCreateAccessTokenResponse,
  AdminGetAccessTokensResponse,
  GetUserWorkspaceResponse,
} from '@/types/workspace.types'

export async function getUserWorkspaces(
  userId: string
): Promise<ServerActionResponse<GetUserWorkspaceResponse[]>> {
  return withServerAction(async () => {
    return await workspaceApi.getWorkspacesByUserId(userId)
  }, 'getUserWorkspaces')
}

export async function getAccessToken(
  workspaceId: string
): Promise<ServerActionResponse<AdminGetAccessTokensResponse[]>> {
  return withServerAction(async () => {
    return await workspaceApi.getAccessToken(workspaceId)
  }, 'getAccessToken')
}

export async function createAccessToken(
  userId: string,
  workspaceId: string,
  label: string,
  permissions: string[],
  expiresAt: Date
): Promise<ServerActionResponse<AdminCreateAccessTokenResponse>> {
  return withServerAction(async () => {
    return await workspaceApi.createAccessToken(
      userId,
      workspaceId,
      label,
      permissions,
      expiresAt
    )
  }, 'createAccessToken')
}

export async function revokeAccessToken(
  workspaceId: string,
  tokenId: string
): Promise<ServerActionResponse<void>> {
  return withServerAction(async () => {
    await workspaceApi.revokeAccessToken(workspaceId, tokenId)
  }, 'revokeAccessToken')
}

export async function deleteAccessToken(
  workspaceId: string,
  tokenId: string
): Promise<ServerActionResponse<void>> {
  return withServerAction(async () => {
    await workspaceApi.deleteAccessToken(workspaceId, tokenId)
  }, 'deleteAccessToken')
}

export async function rotateAccessToken(
  workspaceId: string,
  tokenId: string,
  userId: string,
  expiresAt?: Date
): Promise<ServerActionResponse<AdminGetAccessTokensResponse>> {
  return withServerAction(async () => {
    return await workspaceApi.rotateAccessToken(workspaceId, tokenId, userId, expiresAt)
  }, 'rotateAccessToken')
}
