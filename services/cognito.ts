'use server'

import { cognitoApi } from '@/api/cognitoServiceApi'
import { withServerAction } from '@/tools/serverActionTools'
import { ServerActionResponse } from '@/types/serverAction.types'
import { AdminCreateUserResponse, AuthenticateResponse, ListUsersResponse } from '@/types/cognito.types'

export async function listCognitoUsers(): Promise<ServerActionResponse<ListUsersResponse>> {
  return withServerAction(async () => {
    return await cognitoApi.listUsers()
  }, 'listCognitoUsers')
}

export async function loginCognitoUser(
  username: string,
  password: string
): Promise<ServerActionResponse<AuthenticateResponse>> {
  return withServerAction(async () => {
    return await cognitoApi.authenticateUser(username, password)
  }, 'loginCognitoUser')
}

export async function deleteCognitoUser(username: string): Promise<ServerActionResponse<null>> {
  return withServerAction(async () => {
    await cognitoApi.adminDeleteUser(username)
    return null
  }, 'deleteCognitoUser')
}

export async function createCognitoUser(params: {
  email: string
  temporaryPassword: string
}): Promise<ServerActionResponse<AdminCreateUserResponse>> {
  return withServerAction(async () => {
    const cognitoUser = await cognitoApi.adminCreateUser(params)

    try {
      await cognitoApi.adminSetUserPassword(cognitoUser.User.Username, params.temporaryPassword)
    } catch (err: unknown) {
      console.warn('[createCognitoUser] failed to set permanent password:', err)
    }

    return cognitoUser
  }, 'createCognitoUser')
}
