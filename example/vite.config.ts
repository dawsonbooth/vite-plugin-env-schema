import { defineConfig } from 'vite'
import envSchema from 'vite-plugin-env-schema'

// Zod Example (default)
import { z } from 'zod'
const schema = z.object({
  API_URL: z.url(),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  DEBUG: z.string().transform(val => val === 'true'),
  FEATURE_FLAGS: z
    .string()
    .transform(val => val.split(',').map(s => s.trim()))
    .optional(),
})

// Valibot Example (uncomment to try)
// import * as v from 'valibot'
// const schema = v.object({
//   API_URL: v.pipe(v.string(), v.url()),
//   PORT: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1)),
//   DEBUG: v.pipe(v.string(), v.transform(val => val === 'true')),
//   FEATURE_FLAGS: v.optional(v.pipe(v.string(), v.transform(val => val.split(',').map(s => s.trim())))),
// })

// ArkType Example (uncomment to try)
// import { type } from 'arktype'
// const schema = type({
//   'API_URL': 'string.url',
//   'PORT': 'string.integer.moreThan(0)',
//   'DEBUG': 'string.as(boolean)',
//   'FEATURE_FLAGS?': 'string.split(",").map(trim)',
// })

// Effect Schema Example (uncomment to try)
// import * as S from 'effect/Schema'
// const schema = S.Struct({
//   API_URL: S.String.pipe(S.filter(url => {
//     try { new URL(url); return true } catch { return false }
//   })),
//   PORT: S.String.pipe(S.transform(S.Number, { decode: Number, encode: String })),
//   DEBUG: S.String.pipe(S.transform(S.Boolean, { decode: val => val === 'true', encode: String })),
//   FEATURE_FLAGS: S.optional(S.String.pipe(S.transform(S.Array(S.String), {
//     decode: val => val.split(',').map(s => s.trim()),
//     encode: arr => arr.join(',')
//   }))),
// })

// Yup Example (uncomment to try)
// import * as yup from 'yup'
// const schema = yup.object({
//   API_URL: yup.string().url().required(),
//   PORT: yup.string().transform(Number).required(),
//   DEBUG: yup.string().transform(val => val === 'true').required(),
//   FEATURE_FLAGS: yup.string().transform(val => val.split(',').map(s => s.trim())).optional(),
// })

export default defineConfig({
  plugins: [envSchema(schema)],
})
