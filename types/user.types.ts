import { z } from 'zod'

export enum MembershipRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export const GetUserResponse = z.object({
  id: z.string(),
  email: z.string().email(),
  identityProvider: z.string(),
  identityProviderId: z.string(),
  status: z.enum(['active', 'suspended', 'deactivated']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type GetUserResponse = z.infer<typeof GetUserResponse>

export const MembershipSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  region: z.string(),
  role: z.nativeEnum(MembershipRole),
  joinedAt: z.coerce.date(),
})
export type MembershipResponse = z.infer<typeof MembershipSchema>
