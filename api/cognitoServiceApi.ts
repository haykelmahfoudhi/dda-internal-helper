import {
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  AuthenticateResponse,
  ListUsersResponse,
} from '@/types/cognito.types'
import cognitoServiceConnector from './cognitoServiceConnector'

const POOL_NAME = 'local-user-pool'
const CLIENT_NAME = 'dda-support-client'
let cachedPoolId: string | null = null
let cachedClientId: string | null = null

async function getPoolId(): Promise<string> {
  if (cachedPoolId) return cachedPoolId

  if (process.env.NEXT_COGNITO_POOL_ID) {
    cachedPoolId = process.env.NEXT_COGNITO_POOL_ID
    return cachedPoolId
  }

  const response = await cognitoServiceConnector.request({
    method: 'POST',
    url: '/',
    headers: {
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.ListUserPools',
    },
    data: { MaxResults: 60 },
  }) as { UserPools: { Id: string; Name: string }[] }

  const pool = response.UserPools.find((p: { Name: string }) => p.Name === POOL_NAME)
  if (!pool) {
    throw new Error(`User pool "${POOL_NAME}" not found. Run init-cognito.sh first.`)
  }

  cachedPoolId = pool.Id!
  return cachedPoolId
}

async function getClientId(): Promise<string> {
  if (cachedClientId) return cachedClientId

  if (process.env.NEXT_COGNITO_CLIENT_ID) {
    cachedClientId = process.env.NEXT_COGNITO_CLIENT_ID
    return cachedClientId
  }

  const userPoolId = await getPoolId()
  const response = await cognitoServiceConnector.request({
    method: 'POST',
    url: '/',
    headers: {
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.ListUserPoolClients',
    },
    data: { UserPoolId: userPoolId, MaxResults: 60 },
  }) as { UserPoolClients: { ClientId: string; ClientName?: string }[] }

  const client =
    response.UserPoolClients.find((c) => c.ClientName === CLIENT_NAME) ??
    response.UserPoolClients[0]
  if (!client) {
    throw new Error(`App client "${CLIENT_NAME}" not found. Run init-cognito.sh first.`)
  }

  cachedClientId = client.ClientId
  return cachedClientId
}

export const cognitoApi = {
  async listUsers(): Promise<ListUsersResponse> {
    try {
      const userPoolId = await getPoolId()
      return await cognitoServiceConnector.request({
        method: 'POST',
        url: '/',
        headers: {
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.ListUsers',
        },
        data: {
          UserPoolId: userPoolId,
          Limit: 60,
        },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to list users'
      throw new Error(message)
    }
  },

  async adminDeleteUser(username: string): Promise<void> {
    try {
      const userPoolId = await getPoolId()
      await cognitoServiceConnector.request({
        method: 'POST',
        url: '/',
        headers: {
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.AdminDeleteUser',
        },
        data: {
          UserPoolId: userPoolId,
          Username: username,
        },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete user'
      throw new Error(message)
    }
  },

  async authenticateUser(username: string, password: string): Promise<AuthenticateResponse> {
    try {
      const result = await cognitoServiceConnector.request({
        method: 'POST',
        url: '/',
        headers: {
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        },
        data: {
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: await getClientId(),
          AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
          },
        },
      }) as { AuthenticationResult: AuthenticateResponse }

      return result.AuthenticationResult
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to authenticate'
      throw new Error(message)
    }
  },

  async adminSetUserPassword(username: string, password: string): Promise<void> {
    const userPoolId = await getPoolId()
    await cognitoServiceConnector.request({
      method: 'POST',
      url: '/',
      headers: {
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.AdminSetUserPassword',
      },
      data: {
        UserPoolId: userPoolId,
        Username: username,
        Password: password,
        Permanent: true,
      },
    })
  },

  async adminCreateUser(params: {
    email: string
    temporaryPassword: string
  }): Promise<AdminCreateUserResponse> {
    try {
      const userPoolId = await getPoolId()
      const body: AdminCreateUserRequest = {
        UserPoolId: userPoolId,
        Username: params.email,
        TemporaryPassword: params.temporaryPassword,
        UserAttributes: [
          { Name: 'email', Value: params.email },
          { Name: 'email_verified', Value: 'true' },
        ],
        MessageAction: 'SUPPRESS',
      }

      return await cognitoServiceConnector.request({
        method: 'POST',
        url: '/',
        headers: {
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.AdminCreateUser',
        },
        data: body,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create user'
      throw new Error(message)
    }
  },
}
