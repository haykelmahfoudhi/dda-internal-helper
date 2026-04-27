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
  firstName: z.string(),
  lastName: z.string(),
  identityProviderId: z.string().optional(),

  phone: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? undefined),
  country: z.string(),
  region: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? undefined),
  timezone: z.string(),
  locale: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? undefined),

  preferredLanguage: z.string().default('en'),
  status: z.enum(['active', 'suspended', 'deactivated']),
  lastProfileUpdateDate: z.coerce.date(),
})
export type GetUserResponse = z.infer<typeof GetUserResponse>

export const MembershipSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  region: z.string(),
  role: z.nativeEnum(MembershipRole),
  isActive: z.boolean(),
  joinedAt: z.date(),
})
export type MembershipResponse = z.infer<typeof MembershipSchema>
