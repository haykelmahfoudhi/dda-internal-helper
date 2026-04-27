export type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug'

const isServer = typeof window === 'undefined'

interface LoggerInterface {
  error: (msg: unknown, ...meta: unknown[]) => void
  warn: (msg: unknown, ...meta: unknown[]) => void
  info: (msg: unknown, ...meta: unknown[]) => void
  debug: (msg: unknown, ...meta: unknown[]) => void
}

let defaultLogger: LoggerInterface | null = null

const getLogger = (): LoggerInterface => {
  if (defaultLogger) return defaultLogger

  if (!isServer) {
    defaultLogger = {
      error: (msg: unknown) => console.error('[ERROR]', msg),
      warn: (msg: unknown) => console.warn('[WARN]', msg),
      info: (msg: unknown) => console.log('[INFO]', msg),
      debug: (msg: unknown) => console.log('[DEBUG]', msg),
    }
    return defaultLogger
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const winston = require('winston')
    const { transports } = winston

    defaultLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format:
        process.env.NODE_ENV === 'development'
          ? winston.format.combine(winston.format.colorize(), winston.format.simple())
          : winston.format.json(),
      transports: [
        new transports.Console({
          handleExceptions: true,
          stderrLevels: ['error'],
        }),
      ],
      exitOnError: false,
    })
  } catch {
    defaultLogger = {
      error: (msg: unknown) => console.error('[ERROR]', msg),
      warn: (msg: unknown) => console.warn('[WARN]', msg),
      info: (msg: unknown) => console.log('[INFO]', msg),
      debug: (msg: unknown) => console.log('[DEBUG]', msg),
    }
  }

  return defaultLogger as LoggerInterface
}

export class Logger {
  constructor(private context = '') {}

  private formatMessage(message: unknown): string {
    return this.context ? `[${this.context}] ${String(message)}` : String(message)
  }

  error(message: unknown, ...meta: unknown[]): void {
    getLogger().error(this.formatMessage(message), ...meta)
  }
  warn(message: unknown, ...meta: unknown[]): void {
    getLogger().warn(this.formatMessage(message), ...meta)
  }
  info(message: unknown, ...meta: unknown[]): void {
    getLogger().info(this.formatMessage(message), ...meta)
  }
  debug(message: unknown, ...meta: unknown[]): void {
    getLogger().debug(this.formatMessage(message), ...meta)
  }
}
