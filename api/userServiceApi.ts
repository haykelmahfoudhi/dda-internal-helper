import { GetUserResponse, MembershipResponse } from '@/types/user.types'
import userServiceConnector from './userServiceConnector'

export const userApi = {
  async getUserById(userId: string): Promise<GetUserResponse> {
    try {
      return await userServiceConnector.get(`/api/v1/admin/user/${userId}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user'
      throw new Error(message)
    }
  },
  async getUsersByEmail(email: string): Promise<GetUserResponse[]> {
    try {
      return await userServiceConnector.get(`/api/v1/admin/users`, { params: { email } })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user by email'
      throw new Error(message)
    }
  },
  async getUserMembershipsByUserId(userId: string): Promise<MembershipResponse[]> {
    try {
      return await userServiceConnector.get(`/api/v1/admin/memberships/user/${userId}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user memberships'
      throw new Error(message)
    }
  },
}
