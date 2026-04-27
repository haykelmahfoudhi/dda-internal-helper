/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/serverActionUtils.ts

import { Logger } from '@/infra/logger'
import { ApiError, ServerActionResponse } from '@/types/serverAction.types'

const logger = new Logger('serverActionUtils')

/**
 * Ensures data is JSON-serializable by deep clone
 */
export function ensureSerializable<T>(data: T): T {
  try {
    const safeData = data === undefined ? null : data
    return JSON.parse(JSON.stringify(safeData))
  } catch (error) {
    logger.error('Failed to serialize data:', error)
    throw new Error('Data serialization failed')
  }
}

/**
 * Wraps server action logic with standardized error handling
 */
export async function withServerAction<T>(
  action: () => Promise<T>,
  errorPrefix?: string
): Promise<ServerActionResponse<T>> {
  try {
    const result = await action()
    const serializedResult = ensureSerializable(result)

    return {
      success: true,
      data: serializedResult,
    }
  } catch (error: unknown) {
    const err = error as {
      message?: string
      code?: string
      status?: number
      toString?: () => string
    }
    logger.error(`${errorPrefix || 'Server action'} error:`, error)

    const errorMessage = err?.message || err?.toString?.() || 'An unexpected error occurred'
    const errorCode = err?.code || err?.status?.toString()

    return {
      success: false,
      error: errorMessage,
      ...(errorCode && { code: errorCode }),
    }
  }
}

/**
 * Creates a standardized error object
 */
export function createApiError(error: any): ApiError {
  return {
    message: error?.message || error?.toString() || 'Unknown error',
    status: error?.status,
    statusText: error?.statusText,
    code: error?.code,
  }
}
