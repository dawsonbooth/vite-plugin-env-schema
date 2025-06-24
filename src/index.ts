import { type StandardSchemaV1 } from '@standard-schema/spec'
import { type Plugin, loadEnv } from 'vite'

const envSchema = (envSchema: StandardSchemaV1): Plugin => {
  const virtualModuleId = 'virtual:env'
  const resolvedVirtualModuleId = `\0${virtualModuleId}`

  let validatedEnv: unknown

  return {
    name: 'vite-plugin-env',
    configResolved: async config => {
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

      validatedEnv = validationResult.value
    },
    resolveId: id => {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load: id => {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(validatedEnv)}`
      }
    },
  }
}

export default envSchema
