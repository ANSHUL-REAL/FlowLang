import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, Play, RotateCcw, TerminalSquare } from 'lucide-react'
import { AiTutorPanel } from '@/components/AiTutorPanel'
import { lex } from '../engine/lexer'
import { runFlowLang } from '../engine/runFlowLang'

const examples = [
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'NumPy-style series math over a simple sales vector.',
    code: `let sales = [12, 18, 25, 31, 42]
let smooth = linspace(0, 1, 5)

say sum(sales)
say mean(sales)
say median(sales)
say std(sales)
say normalize(sales)
say smooth`,
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Pandas-style table filtering, selection, and summary.',
    code: `let sales = table(
  ["city", "sales", "team"],
  [
    ["Delhi", 42, "north"],
    ["Pune", 18, "west"],
    ["Jaipur", 31, "north"],
    ["Chennai", 27, "south"]
  ]
)

let north = filterEq(sales, "team", "north")
let top = sortBy(filterGt(sales, "sales", 20), "sales", "desc")
let summary = describe(sales)

say north
say top
say summary`,
  },
  {
    id: 'ui',
    label: 'Dashboard',
    description: 'Render a small interface from FlowLang instead of a toy button.',
    code: `create "section" id panel
setText panel "Regional Sales"
style panel {
  padding 20
  background #14213d
  color white
}

create "button" id refresh
setText refresh "Refresh metrics"
style refresh {
  padding 12
  background #fca311
  color #111827
}

onClick refresh {
  say "Refreshing dashboard"
}`,
  },
  {
    id: 'functions',
    label: 'Functions',
    description: 'Reusable business logic with loops and ranges.',
    code: `func growth(start, finish, count) {
  let ramp = linspace(start, finish, count)
  say ramp
}

growth(10, 30, 6)

for quarter in 1..4 {
  say "Q" + quarter
}`,
  },
  {
    id: 'errors',
    label: 'Errors',
    description: 'See how FlowLang surfaces clear runtime mistakes.',
    code: `let sales = [12, 18, 25]
say mean("not-a-list")
say unknown_metric`,
  },
  {
    id: 'basics',
    label: 'Basics',
    description: 'Keep the core syntax approachable for beginners.',
    code: `let x = 10
if x == 10 {
  say "Correct"
}

repeat 3 {
  say "FlowLang"
}

for i in 1..3 {
  say i
}`,
  },
  {
    id: 'strings',
    label: 'Strings',
    description: 'String output with readable branching.',
    code: `let mood = "curious"
say mood

if mood == "curious" {
  say "Keep exploring"
}

func greet(name) {
  say "Hello " + name
}

greet("Anshul")`,
  },
  {
    id: 'sort',
    label: 'Series Ops',
    description: 'Sorting, uniqueness, and dot products on vectors.',
    code: `let a = [3, 8, 3, 1]
let b = [1, 2, 3, 4]

say sort(a)
say unique(a)
say dot(a, b)
say max(a)
say min(a)`,
  },
  {
    id: 'search',
    label: 'Filter',
    description: 'Work through a table like a small dataframe.',
    code: `let people = table(
  ["name", "score"],
  [
    ["Asha", 88],
    ["Rahul", 73],
    ["Mina", 95]
  ]
)

let picked = select(filterGt(people, "score", 80), ["name", "score"])
say picked`,
  },
  {
    id: 'input',
    label: 'Input',
    description: 'Mock input flow for future auth and app interactions.',
    code: `input email "Enter your email"
say email

create "div" id status
setText status "Waiting for sign in"`,
  },
  {
    id: 'logic',
    label: 'Logic',
    description: 'Combine conditions more like Python or JavaScript.',
    code: `let score = 85
if score > 80 and score < 90 {
  say "Strong performance"
}

if score == 100 or score > 90 {
  say "Top tier"
} else {
  say "Keep pushing"
}`,
  },
  {
    id: 'looping',
    label: 'Looping',
    description: 'Count over ranges and list data.',
    code: `for i in 1..5 {
  say i
}

let nums = [2, 4, 6]
for n in nums {
  say n
}

repeat 2 {
  say "done"
}`,
  },
  {
    id: 'modeling',
    label: 'Modeling',
    description: 'Use FlowLang like a tiny notebook for quick calculations.',
    code: `let weights = [1.2, 0.8, 1.4, 1.1]
let normalized = normalize(weights)
say normalized
say sum(normalized)

let forecast = linspace(100, 160, 4)
say forecast
say mean(forecast)`,
  },
  {
    id: 'clean-ui',
    label: 'Clean UI',
    description: 'Create a small app shell instead of a single demo button.',
    code: `create "section" id card
setText card "Team Snapshot"
style card {
  padding 18
  background #111827
  color white
}

create "button" id action
setText action "Run analysis"
style action {
  padding 12
  background #22c55e
  color #04130a
}

onClick action {
  say "Analysis started"
}`,
  },
  {
    id: 'math',
    label: 'Math',
    description: 'Grouped arithmetic and comparison.',
    code: `let total = (8 + 4) * 2
let limit = 20

say total

if total > limit {
  say "Above the limit"
}`,
  },
  {
    id: 'range',
    label: 'Range',
    description: 'Loop over a Python-style number range.',
    code: `for i in 1..5 {
  if i > 2 and i < 5 {
    say "middle " + i
  }
}`,
  },
] as const

const starterCode = examples[0].code
const defaultExampleId = examples[0].id

export function Playground() {
  const [code, setCode] = useState<string>(starterCode)
  const [result, setResult] = useState(() => runFlowLang(starterCode))
  const [activeExample, setActiveExample] = useState<(typeof examples)[number]['id']>(defaultExampleId)
  const [copied, setCopied] = useState<'code' | 'output' | null>(null)
  const errorLine = result.error?.line

  const runCode = () => {
    setResult(runFlowLang(code))
  }

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(null), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      runCode()
    }
  }

  const sourceLines = code.split('\n')
  const highlighted = errorLine ? sourceLines[errorLine - 1] : ''
  const lineNumbers = sourceLines.map((_, index) => index + 1)

  const tokenPreview = useMemo(() => {
    try {
      return lex(code)
        .filter((token) => token.type !== 'EOF')
        .slice(0, 16)
        .map((token) => token.type)
    } catch {
      return []
    }
  }, [code])

  const codeStats = useMemo(() => {
    const characters = code.length
    const lines = sourceLines.length
    const tokens = tokenPreview.length
    return { characters, lines, tokens }
  }, [code, sourceLines.length, tokenPreview.length])

  const visualDom = result.ok ? result.ui ?? [] : []
  const dataArtifacts = result.ok ? result.data ?? [] : []

  const loadExample = (exampleId: (typeof examples)[number]['id']) => {
    const example = examples.find((entry) => entry.id === exampleId)
    if (!example) return
    setActiveExample(example.id)
    setCode(example.code)
    setResult(runFlowLang(example.code))
  }

  const insertSnippet = (snippet: string) => {
    setActiveExample('ui')
    setCode(snippet)
    setResult(runFlowLang(snippet))
  }

  const resetCode = () => {
    setActiveExample(defaultExampleId)
    setCode(starterCode)
    setResult(runFlowLang(starterCode))
  }

  const copyText = async (value: string, kind: 'code' | 'output') => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
    } catch {
      setCopied(null)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${activeExample}.flow`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section id="playground" className="relative overflow-hidden px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/60">
              <TerminalSquare className="h-3.5 w-3.5" />
              Live Playground
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Write. Run. Understand. Repeat.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 md:text-base">
              Live code editor, token stream, output console, and visual UI preview. Everything updates inside the
              playground so you can see what each line becomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              type="button"
              onClick={runCode}
              aria-label="Run FlowLang code"
            >
              <Play size={16} />
              Run
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              type="button"
              onClick={resetCode}
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              type="button"
              onClick={() => copyText(code, 'code')}
            >
              <Copy size={16} />
              {copied === 'code' ? 'Copied' : 'Copy code'}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              type="button"
              onClick={downloadCode}
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {examples.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => loadExample(example.id)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    activeExample === example.id
                      ? 'bg-white text-black'
                      : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10'
                  }`}
                >
                  {example.label}
                </button>
              ))}
            </div>
            <p className="text-sm leading-7 text-white/55">
              {examples.find((example) => example.id === activeExample)?.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Lines</div>
              <div className="mt-3 text-3xl font-semibold text-white">{codeStats.lines}</div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Tokens</div>
              <div className="mt-3 text-3xl font-semibold text-white">{codeStats.tokens}</div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Characters</div>
              <div className="mt-3 text-3xl font-semibold text-white">{codeStats.characters}</div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Artifacts</div>
              <div className="mt-3 text-3xl font-semibold text-white">{dataArtifacts.length + visualDom.length}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6">
            <label className="flex min-h-[560px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur">
              <span className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-sm text-white/70">
                <span>editor.flow</span>
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Ctrl/Cmd + Enter</span>
              </span>
              <div className="grid flex-1 grid-cols-[56px_1fr]">
                <pre className="border-r border-white/10 bg-black/15 px-3 py-5 text-right font-mono text-[13px] leading-7 text-white/28">
                  {lineNumbers.join('\n')}
                </pre>
                <textarea
                  className="min-h-[500px] flex-1 resize-none bg-transparent px-5 py-5 font-mono text-[15px] leading-7 text-white outline-none placeholder:text-white/20"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                />
              </div>
            </label>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm uppercase tracking-[0.24em] text-white/40">Token stream</h3>
                  <p className="mt-2 text-sm text-white/55">How FlowLang reads the current editor content.</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/35">
                  lexer
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tokenPreview.length ? (
                  tokenPreview.map((token, index) => (
                    <span
                      key={`${token}-${index}`}
                      className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 font-mono text-xs text-sky-100/85"
                    >
                      {token}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-white/45">Token preview appears while the code is valid enough to lex.</span>
                )}
              </div>
            </div>

            <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
              <div className="mb-4">
                <h3 className="text-sm uppercase tracking-[0.24em] text-white/40">Data Lab</h3>
                <p className="mt-2 text-sm leading-7 text-white/55">
                  FlowLang series and tables appear here so the language feels more like a notebook than a toy demo.
                </p>
              </div>

              {dataArtifacts.length ? (
                <div className="space-y-4">
                  {dataArtifacts.map((artifact) => (
                    <div key={artifact.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-mono text-sm text-white">{artifact.name}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-white/35">{artifact.kind}</div>
                        </div>
                      </div>

                      {artifact.kind === 'series' && artifact.values && (
                        <div className="space-y-3">
                          <div className="flex h-28 items-end gap-2 rounded-2xl border border-white/10 bg-black/25 p-3">
                            {artifact.values.map((value, index) => (
                              <div key={`${artifact.name}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                                <div
                                  className="w-full rounded-t-xl bg-sky-400/70"
                                  style={{ height: `${Math.max(10, Math.min(100, Math.abs(value) * 10))}%` }}
                                />
                                <span className="font-mono text-[10px] text-white/45">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {artifact.kind === 'table' && artifact.columns && artifact.rows && (
                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/25">
                          <table className="min-w-full text-left text-sm text-white/70">
                            <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-white/35">
                              <tr>
                                {artifact.columns.map((column) => (
                                  <th key={column} className="px-3 py-2 font-medium">
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {artifact.rows.slice(0, 6).map((row, rowIndex) => (
                                <tr key={`${artifact.name}-${rowIndex}`} className="border-t border-white/10">
                                  {artifact.columns!.map((column) => (
                                    <td key={`${rowIndex}-${column}`} className="px-3 py-2 font-mono text-xs text-white/70">
                                      {String(row[column])}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/45">
                  Run the Analytics or Table examples to preview series math and dataframe-style outputs.
                </div>
              )}
            </aside>
          </div>

          <div className="grid gap-6">
            <section
              className={`flex min-h-[360px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/90 shadow-[0_30px_120px_rgba(0,0,0,0.45)] ${
                result.ok ? '' : 'border-rose-400/40'
              }`}
              aria-live="polite"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-sm text-white/70">
                <span>Output Console</span>
                <div className="flex items-center gap-3">
                  <strong className={`font-medium ${result.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {result.ok ? 'Ready' : `Line ${result.error?.line}`}
                  </strong>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10"
                    type="button"
                    onClick={() => copyText(result.ok ? result.output.join('\n') : result.error?.message ?? '', 'output')}
                  >
                    <Copy size={14} />
                    {copied === 'output' ? 'Copied' : 'Copy output'}
                  </button>
                </div>
              </div>

              <div className="flex-1 px-5 py-5 font-mono text-sm leading-7 text-white/85">
                {result.ok ? (
                  <pre className="whitespace-pre-wrap break-words">
                    {result.output.length ? result.output.join('\n') : 'Run a program to see output here.'}
                  </pre>
                ) : (
                  <div className="rounded-3xl border border-rose-400/30 bg-rose-500/8 p-5">
                    <strong className="block text-base text-rose-200">{result.error?.message}</strong>
                    <p className="mt-2 text-rose-100/70">
                      line {result.error?.line}, column {result.error?.column}
                    </p>
                    {highlighted && (
                      <code className="mt-4 block overflow-x-auto rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-rose-100/90">
                        {highlighted}
                      </code>
                    )}
                  </div>
                )}
              </div>
            </section>

            <AiTutorPanel code={code} result={result} onInsertSnippet={insertSnippet} />

            <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
              <div className="mb-4">
                <h3 className="text-sm uppercase tracking-[0.24em] text-white/40">Explore the language</h3>
                <p className="mt-2 text-sm leading-7 text-white/55">Small syntax, real concepts, and no setup friction.</p>
              </div>
              <div className="space-y-3">
                {[
                  ['Variables', 'let x = 10'],
                  ['Loops', 'repeat 5 { say "hi" }'],
                  ['Ranges', 'for i in 1..5 { say i }'],
                  ['Functions', 'func greet(name) { ... }'],
                  ['Lists', 'let nums = [1, 2, 3]'],
                  ['Series Math', 'mean([1, 2, 3])'],
                  ['Tables', 'table(["city"], [["Delhi"]])'],
                  ['Filters', 'filterGt(data, "sales", 20)'],
                  ['UI', 'create "section" id card'],
                  ['Output', 'say x'],
                  ['Conditions', 'if x == 10 { ... }'],
                  ['Math', '5 + 3 * 2'],
                  ['Logic', 'x > 10 and x < 20'],
                ].map(([label, snippet]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</div>
                    <code className="mt-2 block font-mono text-sm text-white/85">{snippet}</code>
                  </div>
                ))}
              </div>
            </aside>

            <aside className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
              <div className="mb-4">
                <h3 className="text-sm uppercase tracking-[0.24em] text-white/40">Visual DOM Mode</h3>
                <p className="mt-2 text-sm leading-7 text-white/55">UI commands render into a safe tree you can inspect.</p>
              </div>

              {visualDom.length ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="mb-3 font-mono text-xs text-white/35">App</div>
                    <div className="space-y-2 font-mono text-sm text-white/75">
                      {visualDom.map((element) => (
                        <div key={element.id} className="pl-4">
                          |-- {element.tag}#{element.id}
                          {element.text && <span className="text-sky-200"> "{element.text}"</span>}
                          {element.events.length > 0 && <span className="text-emerald-200"> [{element.events.join(', ')}]</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 text-xs uppercase tracking-[0.2em] text-white/35">Preview</div>
                    <div className="flex flex-wrap gap-3">
                      {visualDom.map((element) => {
                        const ElementTag = element.tag as keyof JSX.IntrinsicElements
                        return (
                          <ElementTag
                            key={element.id}
                            style={element.styles}
                            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white shadow-sm"
                          >
                            {element.text || `${element.tag}#${element.id}`}
                          </ElementTag>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/45">
                  Try the UI App example to see elements created, structure updated, and events attached.
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
