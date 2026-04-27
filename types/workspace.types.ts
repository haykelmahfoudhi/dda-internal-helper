import { z } from 'zod'
import { MembershipRole } from './user.types'

export enum WorkspaceStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

export const WorkspaceMemberships = z.object({
  userId: z.string(),
  role: z.nativeEnum(MembershipRole),
  isActive: z.boolean(),
  joinedAt: z.date(),
})
export const GetUserWorkspaceResponse = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  region: z.string(),
  status: z.enum(WorkspaceStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  membership: WorkspaceMemberships,
})

export type GetUserWorkspaceResponse = z.infer<typeof GetUserWorkspaceResponse>

export const AdminGetAccessTokensResponse = z.object({
  id: z.string(),
  tokenId: z.string(),
  workspaceId: z.string(),
  region: z.string(),
  label: z.string(),
  permissions: z.array(z.string()),
  status: z.enum(['ACTIVE', 'REVOKED']),
  createdBy: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
  revokedAt: z.date().optional(),
  lastUsedAt: z.date().optional(),
})
export type AdminGetAccessTokensResponse = z.infer<typeof AdminGetAccessTokensResponse>

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
})

export const AdminCreateAccessTokenResponse = z.object({
  id: z.string(),
  tokenId: z.string(),
  token: TokenResponseSchema,
  workspaceId: z.string(),
  region: z.string(),
  label: z.string(),
  permissions: z.array(z.string()),
  status: z.enum(['ACTIVE', 'REVOKED']),
  createdBy: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
})

export type AdminCreateAccessTokenResponse = z.infer<typeof AdminCreateAccessTokenResponse>
