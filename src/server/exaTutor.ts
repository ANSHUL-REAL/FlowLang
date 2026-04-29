interface ExaTutorRequest {
  mode?: string
  code?: string
  query?: string
  error?: {
    message?: string
    line?: number
    column?: number
  }
}

interface ExaTutorResponse {
  title: string
  body: string
  snippet?: string
  source: 'local' | 'exa'
}

const EXA_ENDPOINT = 'https://api.exa.ai/search'

export async function createExaTutorResponse(body: ExaTutorRequest, apiKey?: string): Promise<ExaTutorResponse> {
  const mode = body.mode ?? 'explain'

  if (!apiKey) {
    return fallback('EXA_API_KEY is not configured yet. The local FlowLang tutor will handle this request.')
  }

  const response = await fetch(EXA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      query: buildQuery(mode, body.code ?? '', body.query ?? '', body.error),
      type: 'auto',
      numResults: 5,
      contents: {
        highlights: {
          maxCharacters: 4000,
        },
      },
      systemPrompt:
        'You are a concise tutor for FlowLang, a beginner-friendly language lab. Prefer clear explanations, practical fixes, and tiny FlowLang examples.',
      outputSchema: {
        type: 'object',
        description: 'A concise FlowLang tutor answer.',
        required: ['title', 'body'],
        properties: {
          title: {
            type: 'string',
            description: 'Short title for the response.',
          },
          body: {
            type: 'string',
            description: 'Helpful explanation in beginner-friendly language.',
          },
          snippet: {
            type: 'string',
            description: 'Optional FlowLang code snippet when useful.',
          },
        },
      },
    }),
  })

  if (!response.ok) {
    return fallback('Exa could not answer right now, so the local FlowLang tutor will handle this request.')
  }

  const data = await response.json()
  const content = data?.output?.content

  if (!content || typeof content !== 'object') {
    return fallback('Exa returned a response, but it did not match the tutor format.')
  }

  return {
    title: typeof content.title === 'string' ? content.title : titleForMode(mode),
    body: typeof content.body === 'string' ? content.body : 'Exa returned a tutor response.',
    snippet: typeof content.snippet === 'string' ? content.snippet : undefined,
    source: 'exa',
  }
}

function fallback(message: string): ExaTutorResponse {
  return {
    title: 'FlowLang Tutor',
    body: message,
    source: 'local',
  }
}

function titleForMode(mode: string) {
  if (mode === 'fix') return 'Smart Error Help'
  if (mode === 'search') return 'Concept Search'
  if (mode === 'snippet') return 'Generated FlowLang Snippet'
  return 'Explain My Code'
}

function buildQuery(mode: string, code: string, query: string, error?: ExaTutorRequest['error']) {
  const base = `FlowLang supports let, say, if, repeat, for, func, lists, create, setText, style, and onClick. Keep the answer short, accurate, and beginner-friendly.`

  if (mode === 'fix') {
    return `${base}\nExplain this FlowLang error and suggest a fix.\nError: ${error?.message ?? 'unknown'} at line ${error?.line ?? '?'} column ${error?.column ?? '?'}\nCode:\n${code}`
  }

  if (mode === 'search') {
    return `${base}\nTeach this concept and include a tiny FlowLang example: ${query || 'FlowLang basics'}`
  }

  if (mode === 'snippet') {
    return `${base}\nGenerate a short FlowLang snippet for this request: ${query || 'create a button app'}`
  }

  return `${base}\nExplain what this FlowLang program does, list the concepts used, and give one real-world analogy.\nCode:\n${code}`
}
