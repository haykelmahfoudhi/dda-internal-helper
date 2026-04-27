import axios, { AxiosError } from 'axios'
import axiosRetry from 'axios-retry'

const BASE_URL = process.env.NEXT_USER_SERVICE_API_URL || 'http://localhost:3000'
const API_KEY = process.env.NEXT_USER_SERVICE_API_KEY || ''

const retryableStatusCodes = [413, 429, 500, 502, 503, 504, 521, 522, 524]
const retryableMethods = ['GET']

const userServiceConnector = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
  timeout: 20000,
})

axiosRetry(userServiceConnector, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    const status = error.response?.status
    const method = error.config?.method?.toUpperCase()

    if (!status || !method) return false

    return retryableStatusCodes.includes(status) && retryableMethods.includes(method)
  },
  onRetry: (retryCount, error) => {
    console.warn(`[UserServiceConnector] - Retry #${retryCount}/3. Reason: ${error.message}`)
  },
})

userServiceConnector.interceptors.request.use((config) => {
  const correlationId = Math.random().toString(36).substring(2, 15)
  config.headers['x-correlation-id'] = correlationId
  if (!config.data && (config.method === 'delete' || config.method === 'DELETE')) {
    config.data = {}
  }
  return config
})

userServiceConnector.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status
    const remoteMessage = error.response?.data?.message ?? error.message

    const apiError = {
      message: `User Service Error: ${remoteMessage}`,
      status,
      statusText: error.response?.statusText,
      code: error.code,
    }
    return Promise.reject(apiError)
  }
)

export default userServiceConnector
