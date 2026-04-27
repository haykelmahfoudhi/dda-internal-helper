'use server'

import { authenticationApi } from '@/api/authenticationServiceApi'
import { withServerAction } from '@/tools/serverActionTools'
import { ServerActionResponse } from '@/types/serverAction.types'
import { ApiKeyCreatedResponseType, ApiKeyResponseType } from '@/types/authentication.types'

export async function getUserApiKeys(
  userId: string
): Promise<ServerActionResponse<ApiKeyResponseType[]>> {
  return withServerAction(async () => {
    const result = await authenticationApi.getUserApiKeys(userId)
    return result
  }, 'getUserApiKeys')
}

export async function createApiKey(
  userId: string,
  description: string,
  expiresAt?: string
): Promise<ServerActionResponse<ApiKeyCreatedResponseType>> {
  return withServerAction(async () => {
    const result = await authenticationApi.createApiKey(userId, description, expiresAt || undefined)
    return result
  }, 'createApiKey')
}

export async function revokeApiKey(apiKeyId: string): Promise<ServerActionResponse<void>> {
  return withServerAction(async () => {
    await authenticationApi.revokeApiKey(apiKeyId)
  }, 'revokeApiKey')
}

export async function rotateApiKey(
  apiKeyId: string
): Promise<ServerActionResponse<ApiKeyCreatedResponseType>> {
  return withServerAction(async () => {
    const result = await authenticationApi.rotateApiKey(apiKeyId)
    return result
  }, 'rotateApiKey')
}
