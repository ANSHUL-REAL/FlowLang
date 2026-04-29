import { FlowLangError } from './errors'
import { type FlowDataArtifact, type FlowElement, interpret } from './interpreter'
import { lex } from './lexer'
import { parse } from './parser'

export interface FlowLangRunResult {
  ok: boolean
  output: string[]
  ui?: FlowElement[]
  data?: FlowDataArtifact[]
  error?: {
    message: string
    line: number
    column: number
  }
}

export function runFlowLang(source: string): FlowLangRunResult {
  try {
    if (!source.trim()) return { ok: true, output: [] }
    const tokens = lex(source)
    const program = parse(tokens)
    const result = interpret(program)
    return {
      ok: true,
      output: result.output,
      ...(result.ui.length ? { ui: result.ui } : {}),
      ...(result.data.length ? { data: result.data } : {}),
    }
  } catch (error) {
    if (error instanceof FlowLangError) {
      return {
        ok: false,
        output: [],
        error: {
          message: error.message,
          line: error.line,
          column: error.column,
        },
      }
    }

    return {
      ok: false,
      output: [],
      error: {
        message: 'FlowLang hit an unexpected problem, but the page is still safe.',
        line: 1,
        column: 1,
      },
    }
  }
}
