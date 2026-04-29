import { useState } from 'react'
import { Bot, Lightbulb, Search, Sparkles, WandSparkles } from 'lucide-react'

import { askFlowTutor, type TutorMode, type TutorResponse } from '@/lib/flowTutor'
import type { FlowLangRunResult } from '@/engine/runFlowLang'

interface AiTutorPanelProps {
  code: string
  result: FlowLangRunResult
  onInsertSnippet: (snippet: string) => void
}

export function AiTutorPanel({ code, result, onInsertSnippet }: AiTutorPanelProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState<TutorMode | null>(null)
  const [response, setResponse] = useState<TutorResponse | null>(null)

  const ask = async (mode: TutorMode) => {
    setLoading(mode)
    try {
      const next = await askFlowTutor({
        mode,
        code,
        query,
        error: result.error,
      })
      setResponse(next)
    } finally {
      setLoading(null)
    }
  }

  return (
    <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-100/75">
            <Bot className="h-3.5 w-3.5" />
            Exa tutor
          </span>
          <h3 className="text-xl font-semibold text-white">AI-powered learning</h3>
          <p className="mt-2 text-sm leading-7 text-white/55">
            Explain code, fix errors, search concepts, or generate a starter snippet without leaving the editor.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => ask('explain')}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90"
        >
          <Lightbulb className="h-4 w-4" />
          {loading === 'explain' ? 'Explaining...' : 'Explain code'}
        </button>
        <button
          type="button"
          onClick={() => ask('fix')}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <WandSparkles className="h-4 w-4" />
          {loading === 'fix' ? 'Checking...' : 'Fix error'}
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="How to filter a table?"
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
        />
        <button
          type="button"
          onClick={() => ask('search')}
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
          aria-label="Search concept"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => ask('snippet')}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-500/15"
      >
        <Sparkles className="h-4 w-4" />
        {loading === 'snippet' ? 'Generating...' : 'Generate FlowLang snippet'}
      </button>

      {response && (
        <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h4 className="font-medium text-white">{response.title}</h4>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/35">
              {response.source}
            </span>
          </div>
          <p className="text-sm leading-7 text-white/60">{response.body}</p>
          {response.snippet && (
            <div className="mt-4">
              <pre className="whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-xs leading-6 text-white/75">
                {response.snippet}
              </pre>
              <button
                type="button"
                onClick={() => onInsertSnippet(response.snippet!)}
                className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Insert snippet
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
