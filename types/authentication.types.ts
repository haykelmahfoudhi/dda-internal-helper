import { z } from 'zod'

export const CreateApiKeyRequest = z.object({
  userId: z.string().describe('ID of the user for whom the API key is being created'),
  description: z.string().describe('Human-readable description of the API key'),
  expiresAt: z.string().optional().describe('Optional ISO date string for key expiration'),
})

export type CreateApiKeyRequestType = z.infer<typeof CreateApiKeyRequest>

export const ApiKeyCreatedResponse = z.object({
  key: z.string().describe('The raw API key - shown only once at creation'),
})

export type ApiKeyCreatedResponseType = z.infer<typeof ApiKeyCreatedResponse>

export const ApiKeyResponse = z.object({
  id: z.string().describe('Unique identifier of the API key'),
  keyPrefix: z.string().describe('First 16 characters of the key for display'),
  userId: z.string().describe('User ID associated with this API key'),
  description: z.string().describe('Human-readable description'),
  expiresAt: z.date().nullable().optional().describe('Expiration date'),
  revokedAt: z.date().nullable().optional().describe('Revocation date'),
  lastUsedAt: z.date().nullable().optional().describe('Last usage date'),
  createdBy: z.string().describe('Admin user who created this key'),
  createdAt: z.date().describe('Creation timestamp'),
  updatedAt: z.date().describe('Last update timestamp'),
})

export type ApiKeyResponseType = z.infer<typeof ApiKeyResponse>

export const ListApiKeysResponse = z.array(ApiKeyResponse)

export type ListApiKeysResponseType = z.infer<typeof ListApiKeysResponse>
