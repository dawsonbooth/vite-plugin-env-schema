import type { StandardSchemaV1 } from '@standard-schema/spec'
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type { ResolvedConfig } from 'vite'
import envSchema from '../src/index'

const mockLoadEnv = mock(() => ({}))
void mock.module('vite', () => ({
  loadEnv: mockLoadEnv,
}))

function createMockSchema(validateResult: {
  value?: unknown
  issues?: Array<{ path?: string | readonly string[]; message: string }>
}): StandardSchemaV1 {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: mock(async () => {
        if (validateResult.issues) {
          return {
            issues: validateResult.issues.map(issue => ({
              message: issue.message,
              path: typeof issue.path === 'string' ? [issue.path] : issue.path,
            })),
          }
        }
        return {
          value: validateResult.value,
          issues: undefined,
        }
      }),
    },
  }
}

describe('vite-plugin-env-schema', () => {
  beforeEach(() => {
    mockLoadEnv.mockClear()
  })

  describe('plugin configuration', () => {
    it('should return a plugin with correct name and hooks', () => {
      const schema = createMockSchema({ value: {} })

      const plugin = envSchema(schema)

      expect(plugin.name).toBe('vite-plugin-env-schema')
      expect(plugin).toHaveProperty('configResolved')
      expect(plugin).toHaveProperty('resolveId')
      expect(plugin).toHaveProperty('load')
      expect(typeof plugin.configResolved).toBe('function')
      expect(typeof plugin.resolveId).toBe('function')
      expect(typeof plugin.load).toBe('function')
    })
  })

  describe('environment validation', () => {
    it('should validate environment variables successfully', async () => {
      const validatedEnv = {
        API_URL: 'https://api.example.com',
        PORT: 3000,
        DEBUG: 'true',
      }
      const schema = createMockSchema({ value: validatedEnv })

      mockLoadEnv.mockReturnValue({
        VITE_API_URL: 'https://api.example.com',
        VITE_PORT: '3000',
        VITE_DEBUG: 'true',
      })

      const plugin = envSchema(schema)
      const mockConfig = { mode: 'development' } as ResolvedConfig

      await plugin.configResolved.call(null, mockConfig)

      expect(schema['~standard'].validate).toHaveBeenCalledWith({
        API_URL: 'https://api.example.com',
        PORT: '3000',
        DEBUG: 'true',
      })
    })

    it('should throw detailed error when validation fails', async () => {
      const schema = createMockSchema({
        issues: [{ path: 'API_URL', message: 'Invalid URL format' }],
      })

      mockLoadEnv.mockReturnValue({
        VITE_API_URL: 'not-a-valid-url',
        VITE_PORT: '3000',
      })

      const plugin = envSchema(schema)
      const mockConfig = { mode: 'development' } as ResolvedConfig

      try {
        await plugin.configResolved.call(null, mockConfig)
        expect().fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.message).toContain('Invalid environment configuration')
          expect(error.message).toContain('API_URL: Invalid URL format')
        }
      }
    })

    it('should handle missing environment variables', async () => {
      const schema = createMockSchema({
        issues: [{ path: 'API_URL', message: 'Required' }],
      })

      mockLoadEnv.mockReturnValue({})

      const plugin = envSchema(schema)
      const mockConfig = { mode: 'development' } as ResolvedConfig

      try {
        await plugin.configResolved.call(null, mockConfig)
        expect().fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.message).toContain('Invalid environment configuration')
          expect(error.message).toContain('API_URL: Required')
        }
      }
    })

    it('should handle validation errors with string paths', async () => {
      const schema = createMockSchema({
        issues: [{ path: 'API_URL', message: 'Invalid URL format' }],
      })

      mockLoadEnv.mockReturnValue({
        VITE_API_URL: 'not-a-valid-url',
      })

      const plugin = envSchema(schema)
      const mockConfig = { mode: 'development' } as ResolvedConfig

      try {
        await plugin.configResolved.call(null, mockConfig)
        expect().fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.message).toContain('Invalid environment configuration')
          expect(error.message).toContain('API_URL: Invalid URL format')
        }
      }
    })

    it('should strip VITE_ prefix from environment variables before validation', async () => {
      const schema = createMockSchema({ value: { API_URL: 'test' } })

      mockLoadEnv.mockReturnValue({
        VITE_API_URL: 'https://api.example.com',
        VITE_DEBUG: 'true',
        OTHER_VAR: 'ignored',
      })

      const plugin = envSchema(schema)
      const mockConfig = { mode: 'development' } as ResolvedConfig

      await plugin.configResolved.call(null, mockConfig)

      expect(schema['~standard'].validate).toHaveBeenCalledWith({
        API_URL: 'https://api.example.com',
        DEBUG: 'true',
      })
    })
  })

  describe('virtual module resolution', () => {
    it('should resolve virtual:env module correctly', () => {
      const plugin = envSchema(createMockSchema({ value: {} }))

      expect(plugin.resolveId.call(null, 'virtual:env')).toBe('\0virtual:env')
      expect(plugin.resolveId.call(null, 'some-other-module')).toBeUndefined()
    })

    it('should generate correct module content for validated environment', async () => {
      const validatedEnv = { API_URL: 'https://api.example.com', DEBUG: 'true' }
      const schema = createMockSchema({ value: validatedEnv })

      mockLoadEnv.mockReturnValue({
        VITE_API_URL: 'https://api.example.com',
        VITE_DEBUG: 'true',
      })

      const plugin = envSchema(schema)
      await plugin.configResolved.call(null, {
        mode: 'development',
      } as ResolvedConfig)

      expect(plugin.load.call(null, '\0virtual:env')).toBe(
        'export default {"API_URL":"https://api.example.com","DEBUG":"true"}',
      )
    })

    it('should return undefined for non-virtual modules', () => {
      const plugin = envSchema(createMockSchema({ value: {} }))
      expect(plugin.load.call(null, 'some-other-module')).toBeUndefined()
    })

    it('should handle loading virtual module before configResolved', () => {
      const plugin = envSchema(createMockSchema({ value: {} }))
      expect(plugin.load.call(null, '\0virtual:env')).toBe(
        'export default undefined',
      )
    })
  })

  describe('loadEnv integration', () => {
    it.each(['production', 'test', 'development'])(
      'should call loadEnv with mode: %s',
      async mode => {
        const schema = createMockSchema({ value: { API_URL: 'test' } })
        mockLoadEnv.mockReturnValue({ VITE_API_URL: 'https://api.example.com' })

        const plugin = envSchema(schema)
        const mockConfig = { mode } as ResolvedConfig

        await plugin.configResolved.call(null, mockConfig)

        expect(mockLoadEnv).toHaveBeenCalledWith(mode, process.cwd(), 'VITE_')
      },
    )
  })
})
