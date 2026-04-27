/* eslint-disable @typescript-eslint/no-explicit-any */
export type ServerActionResponse<T = any> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export interface ApiError {
  message: string
  status?: number
  statusText?: string
  code?: string
}
