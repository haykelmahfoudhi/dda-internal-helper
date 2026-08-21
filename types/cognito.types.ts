export interface CognitoUserAttribute {
  Name: string
  Value: string
}

export interface CognitoUser {
  Username: string
  UserStatus: string
  Enabled: boolean
  UserCreateDate: Date
  UserLastModifiedDate: Date
  Attributes?: CognitoUserAttribute[]
}

export interface ListUsersResponse {
  Users: CognitoUser[]
  PaginationToken?: string
}

export interface AdminCreateUserResponse {
  User: CognitoUser
}

export interface AdminCreateUserRequest {
  UserPoolId: string
  Username: string
  TemporaryPassword: string
  UserAttributes: { Name: string; Value: string }[]
  MessageAction: 'SUPPRESS' | 'RESEND'
}

export interface AuthenticateResponse {
  AccessToken: string
  IdToken: string
  RefreshToken: string
  ExpiresIn?: number
  TokenType?: string
}
