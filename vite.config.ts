import { fileURLToPath, URL } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createExaTutorResponse } from './src/server/exaTutor'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'flowlang-exa-tutor-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/exa-tutor', async (request, response) => {
            if (request.method !== 'POST') {
              response.statusCode = 405
              response.setHeader('Content-Type', 'application/json')
              response.end(JSON.stringify({ title: 'FlowLang Tutor', body: 'Only POST requests are supported.', source: 'local' }))
              return
            }

            let rawBody = ''
            request.on('data', (chunk) => {
              rawBody += chunk
            })
            request.on('end', async () => {
              try {
                const body = rawBody ? JSON.parse(rawBody) : {}
                const data = await createExaTutorResponse(body, env.EXA_API_KEY)
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify(data))
              } catch {
                response.statusCode = 500
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({ title: 'FlowLang Tutor', body: 'The tutor route hit an unexpected problem.', source: 'local' }))
              }
            })
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
    },
  }
})
