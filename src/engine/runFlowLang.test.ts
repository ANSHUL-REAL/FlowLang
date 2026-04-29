import { describe, expect, it } from 'vitest'
import { runFlowLang } from './runFlowLang'

describe('runFlowLang', () => {
  it('executes variables, arithmetic, and output', () => {
    const result = runFlowLang(`let y = 5 + 3 * 2
say y`)

    expect(result).toEqual({ ok: true, output: ['11'] })
  })

  it('executes if blocks when the condition is true', () => {
    const result = runFlowLang(`let x = 10
if x == 10 {
  say "Correct"
}`)

    expect(result).toEqual({ ok: true, output: ['Correct'] })
  })

  it('returns a friendly syntax error', () => {
    const result = runFlowLang('let = 10')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('Expected a variable name')
    expect(result.error?.line).toBe(1)
  })

  it('returns a friendly runtime error', () => {
    const result = runFlowLang('say missing')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain("missing")
  })

  it('handles empty input', () => {
    expect(runFlowLang('   ')).toEqual({ ok: true, output: [] })
  })

  it('executes loops, lists, ranges, and functions', () => {
    const result = runFlowLang(`func greet(name) {
  say "Hello " + name
}

greet("Anshul")

let nums = [1, 2]
for n in nums {
  say n
}

for i in 3..4 {
  say i
}

repeat 2 {
  say "again"
}`)

    expect(result).toEqual({
      ok: true,
      output: ['Hello Anshul', '1', '2', '3', '4', 'again', 'again'],
    })
  })

  it('supports logical conditions', () => {
    const result = runFlowLang(`let x = 15
if x > 10 and x < 20 {
  say "In range"
}`)

    expect(result).toEqual({ ok: true, output: ['In range'] })
  })

  it('collects visual DOM commands safely', () => {
    const result = runFlowLang(`create "button" id btn
setText btn "Click me"
style btn {
  color white
  background blue
  padding 10
}
onClick btn {
  say "clicked"
}`)

    expect(result.ok).toBe(true)
    expect(result.output).toEqual(['Registered click handler for btn.'])
    expect(result.ui).toEqual([
      {
        id: 'btn',
        tag: 'button',
        text: 'Click me',
        styles: { color: 'white', background: 'blue', padding: 10 },
        events: ['click'],
      },
    ])
  })

  it('supports numpy-style series helpers', () => {
    const result = runFlowLang(`let values = [2, 4, 6, 8]
say sum(values)
say mean(values)
say variance(values)
say percentile(values, 75)
say dot(values, [1, 1, 1, 1])
let smooth = linspace(0, 1, 5)
say smooth`)

    expect(result.ok).toBe(true)
    expect(result.output).toEqual(['20', '5', '5', '6.5', '20', 'series(0, 0.25, 0.5, 0.75, 1)'])
    expect(result.data).toEqual([
      { name: 'smooth', kind: 'series', values: [0, 0.25, 0.5, 0.75, 1] },
    ])
  })

  it('supports pandas-style table helpers', () => {
    const result = runFlowLang(`let sales = table(
  ["city", "sales"],
  [
    ["Delhi", 42],
    ["Pune", 18],
    ["Jaipur", 31]
  ]
)
let top = filterGt(sales, "sales", 20)
let mid = filterBetween(sales, "sales", 20, 40)
let renamed = rename(top, "sales", "revenue")
let metrics = describe(sales)
say top
say mid
say renamed
say metrics`)

    expect(result.ok).toBe(true)
    expect(result.data).toEqual([
      {
        name: 'sales',
        kind: 'table',
        columns: ['city', 'sales'],
        rows: [
          { city: 'Delhi', sales: 42 },
          { city: 'Pune', sales: 18 },
          { city: 'Jaipur', sales: 31 },
        ],
      },
      {
        name: 'top',
        kind: 'table',
        columns: ['city', 'sales'],
        rows: [
          { city: 'Delhi', sales: 42 },
          { city: 'Jaipur', sales: 31 },
        ],
      },
      {
        name: 'mid',
        kind: 'table',
        columns: ['city', 'sales'],
        rows: [
          { city: 'Jaipur', sales: 31 },
        ],
      },
      {
        name: 'renamed',
        kind: 'table',
        columns: ['city', 'revenue'],
        rows: [
          { city: 'Delhi', revenue: 42 },
          { city: 'Jaipur', revenue: 31 },
        ],
      },
      {
        name: 'metrics',
        kind: 'table',
        columns: ['column', 'count', 'mean', 'min', 'max'],
        rows: [
          { column: 'sales', count: 3, mean: 30.333, min: 18, max: 42 },
        ],
      },
    ])
  })
})
