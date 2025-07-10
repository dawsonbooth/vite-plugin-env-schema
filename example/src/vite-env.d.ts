/// <reference types="vite/client" />

declare module 'virtual:env' {
  const env: {
    API_URL: string
    PORT: number
    DEBUG: boolean
    FEATURE_FLAGS?: string[]
  }
  export default env
}
