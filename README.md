# vite-plugin-env-schema

[![npm version](http://img.shields.io/npm/v/vite-plugin-env-schema.svg?style=flat)](https://npmjs.org/package/vite-plugin-env-schema)
[![downloads](http://img.shields.io/npm/dt/vite-plugin-env-schema.svg?style=flat)](https://npmjs.org/package/vite-plugin-env-schema)
[![CI](https://github.com/dawsonbooth/vite-plugin-env-schema/workflows/CI/badge.svg)](https://github.com/dawsonbooth/vite-plugin-env-schema/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/dawsonbooth/vite-plugin-env-schema/branch/main/graph/badge.svg)](https://codecov.io/gh/dawsonbooth/vite-plugin-env-schema)
[![license](https://img.shields.io/npm/l/vite-plugin-env-schema.svg?style=flat)](https://github.com/dawsonbooth/vite-plugin-env-schema/blob/master/LICENSE)

Build-time environment variable validation and injection for Vite.

[![Open Example in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/dawsonbooth/vite-plugin-env-schema/tree/main/example)

## Features

- Build-time safety: catches missing or invalid `.env` values before your app runs
- Broad compatibility: works with Zod, Valibot, ArkType, Effect Schema, and more via Standard Schema V1
- Zero-config: minimal setup required
- Automatic injection: access validated env vars via `import env from 'virtual:env'`

## Installation

Install with npm/yarn/bun:

```bash
npm install --save-dev vite-plugin-env-schema
# or yarn add --dev vite-plugin-env-schema
# or bun add --dev vite-plugin-env-schema
```

## Usage

In your `vite.config.ts`:

Here's an example using Zod:

```ts
import { defineConfig } from 'vite'
import envPlugin from 'vite-plugin-env-schema'
import { z } from 'zod' // or replace with your schema library of choice

// Example schema (using Zod here)
const envSchema = z.object({
  API_URL: z.string(),
  DEBUG: z.boolean().default(false),
})

export default defineConfig({
  plugins: [envPlugin(envSchema)],
})
```

Create a `.env` (or `.env.development`, `.env.production`) file:

```env
VITE_API_URL=https://api.example.com
VITE_DEBUG=true
```

## Configuration Options

### `validateOn`

Control when environment validation occurs:

- `'config'` (default): Validate during Vite config resolution - provides immediate feedback
- `'load'`: Validate when the virtual module is loaded - useful for advanced scenarios

```ts
export default defineConfig({
  plugins: [
    envPlugin(envSchema, { validateOn: 'config' }), // default
  ],
})
```

## TypeScript Support

To enable proper type inference when importing the validated env, create a declaration (e.g., `env.d.ts`) in your project root:

```ts
// env.d.ts
declare module 'virtual:env' {
  import type { z } from 'zod'
  import type envSchema from '@/env/env-schema'
  // Infer the TypeScript type from your Zod schema
  const env: z.infer<typeof envSchema>
  export default env
}
```

In your application code:

```ts
import env from 'virtual:env'

console.log(env.API_URL) // https://api.example.com
console.log(env.DEBUG) // true
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License. See [LICENSE](LICENSE) for details.
