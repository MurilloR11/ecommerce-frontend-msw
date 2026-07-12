const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appEnv: import.meta.env.VITE_APP_ENV,
} as const

if (!env.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL no está definida. Revisa tu archivo .env')
}

export { env }
