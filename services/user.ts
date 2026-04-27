'use server'

import { userApi } from '@/api/userServiceApi'
import { withServerAction } from '@/tools/serverActionTools'
import { ServerActionResponse } from '@/types/serverAction.types'
import { GetUserResponse, MembershipResponse } from '@/types/user.types'

export async function searchUsers(query: string): Promise<ServerActionResponse<GetUserResponse[]>> {
  return withServerAction(async () => {
    if (!query.trim()) return []

    const users: GetUserResponse[] = await userApi.getUsersByEmail(query)

    return users.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''))
  }, 'searchUsers')
}

export async function getUserById(id: string): Promise<ServerActionResponse<GetUserResponse>> {
  return withServerAction(async () => {
    return await userApi.getUserById(id)
  }, 'getUserById')
}

export async function getUserMemberships(
  userId: string
): Promise<ServerActionResponse<MembershipResponse[]>> {
  return withServerAction(async () => {
    return await userApi.getUserMembershipsByUserId(userId)
  }, 'getUserMemberships')
}
