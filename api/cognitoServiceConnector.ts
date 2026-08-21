/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios'

const BASE_URL = process.env.NEXT_COGNITO_LOCAL_URL || 'http://localhost:4566'

const cognitoServiceConnector = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/x-amz-json-1.1',
  },
  timeout: 20000,
})

cognitoServiceConnector.interceptors.request.use((config) => {
  const correlationId = Math.random().toString(36).substring(2, 15)
  config.headers['x-correlation-id'] = correlationId
  return config
})

cognitoServiceConnector.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string; __type?: string }>) => {
    const remoteMessage = error.response?.data?.message ?? error.message
    const cognitoError = error.response?.data?.__type ?? ''

    const apiError = new Error(
      `Cognito Error: ${remoteMessage}${cognitoError ? ` (${cognitoError})` : ''}`
    )
    ;(apiError as any).status = error.response?.status
    ;(apiError as any).code = error.code
    return Promise.reject(apiError)
  }
)

export default cognitoServiceConnector
