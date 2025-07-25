import { type StandardSchemaV1 } from '@standard-schema/spec'
import { type Plugin, type ResolvedConfig, loadEnv } from 'vite'

export interface EnvSchemaOptions {
  validateOn?: 'config' | 'load'
}

const envSchema = <TInput = unknown, TOutput = TInput>(
  envSchema: StandardSchemaV1<TInput, TOutput>,
  options: EnvSchemaOptions = {},
) => {
  const { validateOn = 'config' } = options
  const virtualModuleId = 'virtual:env'
  const resolvedVirtualModuleId = `\0${virtualModuleId}`

  let config: ResolvedConfig | null = null
  let validatedEnv: unknown = null

  const parseEnvData = async (): Promise<unknown> => {
    if (!config) {
      return null
    }

    const env = loadEnv(config.mode, process.cwd(), 'VITE_')

    const envVars = Object.fromEntries(
      Object.entries(env)
        .filter(([key]) => key.startsWith('VITE_'))
        .map(([key, value]) => [key.replace('VITE_', ''), value]),
    )

    const validationResult = await envSchema['~standard'].validate(envVars)

    if (validationResult.issues) {
      const formattedErrors = validationResult.issues
        .map(issue => {
          let path = ''
          if (Array.isArray(issue.path)) {
            path = issue.path.join('.')
          } else if (typeof issue.path === 'string') {
            path = issue.path
          }
          return `- ${path}: ${issue.message}`
        })
        .join('\n')
      throw new Error(
        `Invalid environment configuration.\nThe following variables are missing or invalid:\n${formattedErrors}`,
      )
    }

    return validationResult.value
  }

  return {
    name: 'vite-plugin-env-schema',
    async configResolved(resolvedConfig) {
      config = resolvedConfig
      if (validateOn === 'config') {
        validatedEnv = await parseEnvData()
      }
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        if (validateOn === 'load') {
          const envData = await parseEnvData()
          return `export default ${JSON.stringify(envData)}`
        } else {
          return `export default ${JSON.stringify(validatedEnv)}`
        }
      }
    },
  } satisfies Plugin
}

export default envSchema
