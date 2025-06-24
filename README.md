# vite-plugin-env-schema

[![npm version](http://img.shields.io/npm/v/vite-plugin-env-schema.svg?style=flat)](https://npmjs.org/package/vite-plugin-env-schema)
[![downloads](http://img.shields.io/npm/dt/vite-plugin-env-schema.svg?style=flat)](https://npmjs.org/package/vite-plugin-env-schema)
[![build status](https://github.com/dawsonbooth/vite-plugin-env-schema/workflows/build/badge.svg)](https://github.com/dawsonbooth/vite-plugin-env-schema/actions?workflow=build)
[![license](https://img.shields.io/npm/l/vite-plugin-env-schema.svg?style=flat)](https://github.com/dawsonbooth/vite-plugin-env-schema/blob/master/LICENSE)

Build-time environment variable validation and injection for Vite.

## Why Use This Plugin?

- 🚀 Build-time safety: prevents runtime errors from missing or invalid env vars
- 🔄 Broad compatibility: works with Zod, Valibot, ArkType, Effect Schema, and more via Standard Schema V1
- 🎛️ Zero-config: default prefix `VITE_`, minimal setup

## Features

- Build-time safety: catches missing or invalid `.env` values before your app runs
- Broad compatibility: integrate with Zod, Valibot, ArkType, Effect Schema, and more via Standard Schema V1
- Automatic injection: access validated env vars via `import env from 'virtual:env'`
- Prefix filtering: only loads variables matching your chosen prefix (default `VITE_`)
- Customizable prefix & broad schema library support built-in

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
