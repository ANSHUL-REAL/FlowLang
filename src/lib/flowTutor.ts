import type { FlowLangRunResult } from '@/engine/runFlowLang'

export type TutorMode = 'explain' | 'fix' | 'search' | 'snippet'

export interface TutorRequest {
  mode: TutorMode
  code: string
  query?: string
  error?: FlowLangRunResult['error']
}

export interface TutorResponse {
  title: string
  body: string
  snippet?: string
  source: 'local' | 'exa'
}

export async function askFlowTutor(request: TutorRequest): Promise<TutorResponse> {
  try {
    const response = await fetch('/api/exa-tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (response.ok) {
      const data = (await response.json()) as TutorResponse
      if (data.body) return data
    }
  } catch {
    // Vite dev does not serve Vercel API routes. The local tutor keeps the product usable.
  }

  return localTutor(request)
}

function localTutor(request: TutorRequest): TutorResponse {
  if (request.mode === 'fix') {
    return {
      title: 'Smart Error Help',
      body: request.error
        ? `FlowLang stopped because ${request.error.message} Look near line ${request.error.line}, column ${request.error.column}. A common fix is to create the value first with let, or check for a spelling mismatch.`
        : 'Run the program first, then FlowLang can explain the exact error and suggest a fix.',
      source: 'local',
    }
  }

  if (request.mode === 'search') {
    const topic = request.query?.trim() || 'FlowLang'
    return {
      title: `Learn: ${topic}`,
      body: conceptHelp(topic),
      source: 'local',
    }
  }

  if (request.mode === 'snippet') {
    return {
      title: 'Generated FlowLang Snippet',
      body: 'Here is a small interactive button app. It creates a visual element, styles it, and registers a click handler.',
      snippet: `create "button" id btn
setText btn "Click me"
style btn {
  color white
  background blue
  padding 10
}

onClick btn {
  say "Hello, FlowLang!"
}`,
      source: 'local',
    }
  }

  return {
    title: 'Explain My Code',
    body: explainCode(request.code),
    source: 'local',
  }
}

function explainCode(code: string): string {
  const concepts: string[] = []
  if (/\blet\b/.test(code)) concepts.push('variables')
  if (/\bif\b/.test(code)) concepts.push('conditions')
  if (/\brepeat\b|\bfor\b/.test(code)) concepts.push('loops')
  if (/\bfunc\b/.test(code)) concepts.push('functions')
  if (/\[.*\]/s.test(code)) concepts.push('lists')
  if (/\bcreate\b|\bsetText\b|\bonClick\b|\bstyle\b/.test(code)) concepts.push('Visual DOM commands')

  const conceptText = concepts.length ? concepts.join(', ') : 'basic expressions and output'
  return `This program uses ${conceptText}. FlowLang reads the source into tokens, builds an AST to understand the structure, then the interpreter runs each statement. If UI commands are present, they render into the safe Visual DOM preview instead of touching the real browser DOM.`
}

function conceptHelp(topic: string): string {
  const normalized = topic.toLowerCase()

  if (normalized.includes('button') || normalized.includes('ui')) {
    return 'Use create to make an element, setText to label it, style to change its appearance, and onClick to register an interaction. Try: create "button" id btn.'
  }

  if (normalized.includes('loop') || normalized.includes('for') || normalized.includes('repeat')) {
    return 'Loops repeat work. Use repeat 5 { ... } when you know the count, or for i in 1..5 { ... } when you want to walk through a range or list.'
  }

  if (normalized.includes('function')) {
    return 'Functions package reusable behavior. Define one with func greet(name) { ... } and call it with greet("Anshul").'
  }

  if (normalized.includes('error')) {
    return 'FlowLang errors are designed to teach. Read the line and column, then check whether a variable was created, a string was closed, or a block has its closing brace.'
  }

  return 'FlowLang is a language lab. Code becomes tokens, an AST, interpreter output, and sometimes a safe Visual DOM tree.'
}
