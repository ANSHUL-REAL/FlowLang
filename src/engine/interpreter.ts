import type { Expression, FunctionStatement, PrimitiveValue, Program, SeriesValue, Statement, TableValue, Value } from '../types/ast'
import { FlowLangError } from './errors'

export interface FlowElement {
  id: string
  tag: string
  text: string
  styles: Record<string, string | number>
  events: string[]
}

export interface FlowDataArtifact {
  name: string
  kind: 'series' | 'table'
  values?: number[]
  columns?: string[]
  rows?: Array<Record<string, PrimitiveValue>>
}

export interface InterpretationResult {
  output: string[]
  ui: FlowElement[]
  data: FlowDataArtifact[]
}

type Builtin = (args: Value[]) => Value

export function interpret(program: Program): InterpretationResult {
  return new Interpreter().run(program)
}

class Interpreter {
  private readonly scopes: Array<Map<string, Value>> = [new Map()]
  private readonly functions = new Map<string, FunctionStatement>()
  private readonly builtins = new Map<string, Builtin>()
  private readonly output: string[] = []
  private readonly ui = new Map<string, FlowElement>()
  private steps = 0

  constructor() {
    this.registerBuiltins()
  }

  run(program: Program): InterpretationResult {
    for (const statement of program.body) this.execute(statement)

    return {
      output: this.output,
      ui: [...this.ui.values()],
      data: this.collectArtifacts(),
    }
  }

  private execute(statement: Statement): void {
    this.guardStep()

    switch (statement.type) {
      case 'LetStatement':
        this.define(statement.name, this.evaluate(statement.initializer))
        break
      case 'SayStatement':
        this.output.push(this.stringify(this.evaluate(statement.expression)))
        break
      case 'IfStatement':
        if (this.isTruthy(this.evaluate(statement.condition))) this.executeBlock(statement.body)
        break
      case 'RepeatStatement':
        this.executeRepeat(statement.count, statement.body)
        break
      case 'ForStatement':
        this.executeFor(statement.name, statement.iterable, statement.body)
        break
      case 'FunctionStatement':
        this.functions.set(statement.name, statement)
        break
      case 'ExpressionStatement':
        this.evaluate(statement.expression)
        break
      case 'CreateElementStatement':
        this.createElement(statement.id, this.evaluate(statement.tag))
        break
      case 'SetTextStatement':
        this.ensureElement(statement.id).text = this.stringify(this.evaluate(statement.text))
        break
      case 'OnClickStatement':
        this.ensureElement(statement.id).events.push('click')
        this.output.push(`Registered click handler for ${statement.id}.`)
        break
      case 'StyleStatement': {
        const element = this.ensureElement(statement.id)
        for (const style of statement.styles) element.styles[style.property] = style.value
        break
      }
      case 'InputStatement':
        this.define(statement.name, `[input: ${this.stringify(this.evaluate(statement.prompt))}]`)
        break
    }
  }

  private executeRepeat(countExpression: Expression, body: Statement[]): void {
    const count = this.evaluate(countExpression)
    this.ensureNumber(count, 'repeat needs a number, like repeat 5 { ... }.')
    if (!Number.isInteger(count) || count < 0) throw new FlowLangError('repeat needs a whole number that is 0 or higher.')

    for (let index = 0; index < count; index += 1) this.executeBlock(body)
  }

  private executeFor(name: string, iterableExpression: Expression, body: Statement[]): void {
    const iterable = this.evaluate(iterableExpression)
    const values = this.toList(iterable)

    for (const item of values) {
      this.pushScope()
      this.define(name, item)
      this.executeBlock(body, false)
      this.popScope()
    }
  }

  private executeBlock(body: Statement[], createScope = true): void {
    if (createScope) this.pushScope()
    try {
      for (const statement of body) this.execute(statement)
    } finally {
      if (createScope) this.popScope()
    }
  }

  private evaluate(expression: Expression): Value {
    switch (expression.type) {
      case 'LiteralExpression':
        return expression.value
      case 'IdentifierExpression':
        return this.get(expression.name)
      case 'GroupingExpression':
        return this.evaluate(expression.expression)
      case 'ListExpression':
        return expression.items.map((item) => this.evaluate(item))
      case 'RangeExpression':
        return this.evaluateRange(expression.start, expression.end)
      case 'CallExpression':
        return this.callFunction(expression.callee, expression.args)
      case 'UnaryExpression': {
        const right = this.evaluate(expression.right)
        if (expression.operator === '-') {
          this.ensureNumber(right, "Only numbers can be made negative with '-'.")
          return -right
        }
        throw new FlowLangError(`Unknown unary operator '${expression.operator}'.`)
      }
      case 'BinaryExpression':
        if (expression.operator === 'and') return this.isTruthy(this.evaluate(expression.left)) && this.isTruthy(this.evaluate(expression.right))
        if (expression.operator === 'or') return this.isTruthy(this.evaluate(expression.left)) || this.isTruthy(this.evaluate(expression.right))
        return this.evaluateBinary(expression.operator, this.evaluate(expression.left), this.evaluate(expression.right))
    }
  }

  private evaluateRange(startExpression: Expression, endExpression: Expression): Value {
    const start = this.evaluate(startExpression)
    const end = this.evaluate(endExpression)
    this.ensureNumber(start, 'Ranges need numbers on both sides.')
    this.ensureNumber(end, 'Ranges need numbers on both sides.')
    if (!Number.isInteger(start) || !Number.isInteger(end)) throw new FlowLangError('Ranges need whole numbers.')

    const step = start <= end ? 1 : -1
    const values: number[] = []
    for (let current = start; step > 0 ? current <= end : current >= end; current += step) values.push(current)
    return { kind: 'series', values }
  }

  private callFunction(name: string, args: Expression[]): Value {
    const values = args.map((arg) => this.evaluate(arg))

    if (this.builtins.has(name)) {
      return this.builtins.get(name)!(values)
    }

    const fn = this.functions.get(name)
    if (!fn) throw new FlowLangError(`The function '${name}' has not been created yet.`)
    if (args.length !== fn.params.length) {
      throw new FlowLangError(`Function '${name}' expects ${fn.params.length} argument(s), but got ${args.length}.`)
    }

    this.pushScope()
    try {
      fn.params.forEach((param, index) => this.define(param, values[index]))
      this.executeBlock(fn.body, false)
    } finally {
      this.popScope()
    }
    return ''
  }

  private registerBuiltins(): void {
    this.builtins.set('len', ([value]) => {
      if (typeof value === 'string') return value.length
      if (Array.isArray(value)) return value.length
      if (this.isSeries(value)) return value.values.length
      if (this.isTable(value)) return value.rows.length
      throw new FlowLangError('len() works with text, lists, series, or tables.')
    })

    this.builtins.set('sum', ([value]) => this.sumNumbers(value))
    this.builtins.set('mean', ([value]) => {
      const values = this.toNumberArray(value, 'mean() needs a numeric list or series.')
      return values.length ? this.sumArray(values) / values.length : 0
    })
    this.builtins.set('median', ([value]) => {
      const values = [...this.toNumberArray(value, 'median() needs a numeric list or series.')].sort((a, b) => a - b)
      if (!values.length) return 0
      const middle = Math.floor(values.length / 2)
      return values.length % 2 === 0 ? (values[middle - 1] + values[middle]) / 2 : values[middle]
    })
    this.builtins.set('min', ([value]) => Math.min(...this.toNumberArray(value, 'min() needs a numeric list or series.')))
    this.builtins.set('max', ([value]) => Math.max(...this.toNumberArray(value, 'max() needs a numeric list or series.')))
    this.builtins.set('std', ([value]) => {
      const values = this.toNumberArray(value, 'std() needs a numeric list or series.')
      if (!values.length) return 0
      const mean = this.sumArray(values) / values.length
      const variance = values.reduce((total, entry) => total + (entry - mean) ** 2, 0) / values.length
      return Math.sqrt(variance)
    })
    this.builtins.set('variance', ([value]) => {
      const values = this.toNumberArray(value, 'variance() needs a numeric list or series.')
      if (!values.length) return 0
      const mean = this.sumArray(values) / values.length
      return values.reduce((total, entry) => total + (entry - mean) ** 2, 0) / values.length
    })
    this.builtins.set('percentile', ([value, percentileValue]) => {
      const values = [...this.toNumberArray(value, 'percentile() needs a numeric list or series.')].sort((a, b) => a - b)
      const percentile = this.toNumber(percentileValue)
      if (percentile < 0 || percentile > 100) throw new FlowLangError('percentile() needs a value between 0 and 100.')
      if (!values.length) return 0
      const rank = (percentile / 100) * (values.length - 1)
      const lower = Math.floor(rank)
      const upper = Math.ceil(rank)
      if (lower === upper) return values[lower]
      return Number((values[lower] + (values[upper] - values[lower]) * (rank - lower)).toFixed(4))
    })
    this.builtins.set('sort', ([value]) => {
      const values = this.toList(value)
      return [...values].sort((left, right) => this.stringify(left).localeCompare(this.stringify(right), undefined, { numeric: true }))
    })
    this.builtins.set('unique', ([value]) => {
      const values = this.toList(value)
      const seen = new Set(values.map((entry) => this.stringify(entry)))
      return [...seen]
    })
    this.builtins.set('dot', ([left, right]) => {
      const a = this.toNumberArray(left, 'dot() needs two numeric lists or series.')
      const b = this.toNumberArray(right, 'dot() needs two numeric lists or series.')
      if (a.length !== b.length) throw new FlowLangError('dot() needs inputs of the same length.')
      return a.reduce((total, entry, index) => total + entry * b[index], 0)
    })
    this.builtins.set('linspace', ([start, end, count]) => {
      this.ensureNumber(start, 'linspace() needs numeric start and end values.')
      this.ensureNumber(end, 'linspace() needs numeric start and end values.')
      this.ensureNumber(count, 'linspace() needs a numeric count.')
      if (count < 2) return { kind: 'series', values: [start] }
      const step = (end - start) / (count - 1)
      return { kind: 'series', values: Array.from({ length: count }, (_, index) => Number((start + step * index).toFixed(4))) }
    })
    this.builtins.set('normalize', ([value]) => {
      const values = this.toNumberArray(value, 'normalize() needs a numeric list or series.')
      const total = this.sumArray(values)
      if (total === 0) return { kind: 'series', values }
      return { kind: 'series', values: values.map((entry) => Number((entry / total).toFixed(4))) }
    })
    this.builtins.set('table', ([columnsValue, rowsValue]) => this.makeTable(columnsValue, rowsValue))
    this.builtins.set('column', ([tableValue, nameValue]) => {
      const table = this.toTable(tableValue, 'column() needs a table as the first argument.')
      const name = this.toColumnName(nameValue)
      return { kind: 'series', values: table.rows.map((row) => this.toNumber(row[name])) }
    })
    this.builtins.set('head', ([tableValue, countValue]) => {
      const table = this.toTable(tableValue, 'head() needs a table as the first argument.')
      const count = countValue === undefined ? 5 : this.toNumber(countValue)
      return { ...table, rows: table.rows.slice(0, count) }
    })
    this.builtins.set('select', ([tableValue, columnsValue]) => {
      const table = this.toTable(tableValue, 'select() needs a table as the first argument.')
      const columns = this.toStringList(columnsValue, 'select() needs a list of column names.')
      return {
        kind: 'table',
        columns,
        rows: table.rows.map((row) => Object.fromEntries(columns.map((column) => [column, row[column]])) as Record<string, PrimitiveValue>),
      } satisfies TableValue
    })
    this.builtins.set('filterGt', ([tableValue, columnValue, thresholdValue]) => {
      const table = this.toTable(tableValue, 'filterGt() needs a table as the first argument.')
      const column = this.toColumnName(columnValue)
      const threshold = this.toNumber(thresholdValue)
      return { ...table, rows: table.rows.filter((row) => this.toNumber(row[column]) > threshold) }
    })
    this.builtins.set('filterLt', ([tableValue, columnValue, thresholdValue]) => {
      const table = this.toTable(tableValue, 'filterLt() needs a table as the first argument.')
      const column = this.toColumnName(columnValue)
      const threshold = this.toNumber(thresholdValue)
      return { ...table, rows: table.rows.filter((row) => this.toNumber(row[column]) < threshold) }
    })
    this.builtins.set('filterBetween', ([tableValue, columnValue, minValue, maxValue]) => {
      const table = this.toTable(tableValue, 'filterBetween() needs a table as the first argument.')
      const column = this.toColumnName(columnValue)
      const min = this.toNumber(minValue)
      const max = this.toNumber(maxValue)
      return { ...table, rows: table.rows.filter((row) => {
        const value = this.toNumber(row[column])
        return value >= min && value <= max
      }) }
    })
    this.builtins.set('filterEq', ([tableValue, columnValue, targetValue]) => {
      const table = this.toTable(tableValue, 'filterEq() needs a table as the first argument.')
      const column = this.toColumnName(columnValue)
      return { ...table, rows: table.rows.filter((row) => row[column] === targetValue) }
    })
    this.builtins.set('rename', ([tableValue, fromValue, toValue]) => {
      const table = this.toTable(tableValue, 'rename() needs a table as the first argument.')
      const from = this.toColumnName(fromValue)
      const to = this.toColumnName(toValue)
      const columns = table.columns.map((column) => (column === from ? to : column))
      return {
        kind: 'table',
        columns,
        rows: table.rows.map((row) => Object.fromEntries(
          table.columns.map((column) => [column === from ? to : column, row[column]]),
        ) as Record<string, PrimitiveValue>),
      } satisfies TableValue
    })
    this.builtins.set('sortBy', ([tableValue, columnValue, directionValue]) => {
      const table = this.toTable(tableValue, 'sortBy() needs a table as the first argument.')
      const column = this.toColumnName(columnValue)
      const direction = typeof directionValue === 'string' ? directionValue.toLowerCase() : 'asc'
      const rows = [...table.rows].sort((left, right) => {
        const leftValue = left[column]
        const rightValue = right[column]
        const comparison =
          typeof leftValue === 'number' && typeof rightValue === 'number'
            ? leftValue - rightValue
            : String(leftValue).localeCompare(String(rightValue))
        return direction === 'desc' ? -comparison : comparison
      })
      return { ...table, rows }
    })
    this.builtins.set('describe', ([tableValue]) => {
      const table = this.toTable(tableValue, 'describe() needs a table.')
      const numericColumns = table.columns.filter((column) => table.rows.every((row) => typeof row[column] === 'number'))
      return {
        kind: 'table',
        columns: ['column', 'count', 'mean', 'min', 'max'],
        rows: numericColumns.map((column) => {
          const values = table.rows.map((row) => this.toNumber(row[column]))
          return {
            column,
            count: values.length,
            mean: Number((this.sumArray(values) / values.length).toFixed(3)),
            min: Math.min(...values),
            max: Math.max(...values),
          }
        }),
      } satisfies TableValue
    })
  }

  private evaluateBinary(operator: string, left: Value, right: Value): Value {
    switch (operator) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') return `${this.stringify(left)}${this.stringify(right)}`
        return this.withNumbers(left, right, "'+' works with numbers, or joins text when either side is a string.", (a, b) => a + b)
      case '-':
        return this.withNumbers(left, right, "'-' only works with numbers.", (a, b) => a - b)
      case '*':
        return this.withNumbers(left, right, "'*' only works with numbers.", (a, b) => a * b)
      case '/':
        return this.withNumbers(left, right, "'/' only works with numbers.", (a, b) => {
          if (b === 0) throw new FlowLangError('Division by zero is not allowed.')
          return a / b
        })
      case '==':
        return this.stringify(left) === this.stringify(right)
      case '!=':
        return this.stringify(left) !== this.stringify(right)
      case '>':
      case '>=':
      case '<':
      case '<=':
        return this.withNumbers(left, right, `Comparison '${operator}' only works with numbers.`, (a, b) => {
          if (operator === '>') return a > b
          if (operator === '>=') return a >= b
          if (operator === '<') return a < b
          return a <= b
        })
      default:
        throw new FlowLangError(`Unknown operator '${operator}'.`)
    }
  }

  private makeTable(columnsValue: Value, rowsValue: Value): TableValue {
    const columns = this.toStringList(columnsValue, 'table() needs a list of column names.')
    const rowsSource = this.toList(rowsValue)
    const rows = rowsSource.map((rowValue) => {
      const cells = this.toList(rowValue)
      if (cells.length !== columns.length) throw new FlowLangError('Every table row must match the number of columns.')
      return Object.fromEntries(columns.map((column, index) => [column, this.toPrimitive(cells[index])])) as Record<string, PrimitiveValue>
    })

    return { kind: 'table', columns, rows }
  }

  private createElement(id: string, tagValue: Value): void {
    const tag = this.stringify(tagValue)
    if (!/^[a-z][a-z0-9-]*$/i.test(tag)) throw new FlowLangError(`'${tag}' is not a valid element tag.`)
    this.ui.set(id, { id, tag, text: '', styles: {}, events: [] })
  }

  private ensureElement(id: string): FlowElement {
    const element = this.ui.get(id)
    if (!element) throw new FlowLangError(`The UI element '${id}' has not been created yet.`)
    return element
  }

  private define(name: string, value: Value): void {
    this.scopes[this.scopes.length - 1].set(name, value)
  }

  private get(name: string): Value {
    for (let index = this.scopes.length - 1; index >= 0; index -= 1) {
      const scope = this.scopes[index]
      if (scope.has(name)) return scope.get(name)!
    }
    throw new FlowLangError(`The variable '${name}' has not been created yet.`)
  }

  private pushScope(): void {
    this.scopes.push(new Map())
  }

  private popScope(): void {
    this.scopes.pop()
  }

  private guardStep(): void {
    this.steps += 1
    if (this.steps > 5000) throw new FlowLangError('FlowLang stopped this program because it ran too many steps.')
  }

  private collectArtifacts(): FlowDataArtifact[] {
    const artifacts: FlowDataArtifact[] = []
    for (const [name, value] of this.scopes[0].entries()) {
      if (this.isSeries(value)) artifacts.push({ name, kind: 'series', values: value.values })
      if (this.isTable(value)) artifacts.push({ name, kind: 'table', columns: value.columns, rows: value.rows })
    }
    return artifacts
  }

  private isSeries(value: Value): value is SeriesValue {
    return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'series'
  }

  private isTable(value: Value): value is TableValue {
    return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'table'
  }

  private toList(value: Value): Value[] {
    if (Array.isArray(value)) return value
    if (this.isSeries(value)) return value.values
    throw new FlowLangError('This value is not iterable as a list.')
  }

  private toNumberArray(value: Value, message: string): number[] {
    const values = this.toList(value)
    if (!values.every((entry) => typeof entry === 'number')) throw new FlowLangError(message)
    return values as number[]
  }

  private toStringList(value: Value, message: string): string[] {
    const values = this.toList(value)
    if (!values.every((entry) => typeof entry === 'string')) throw new FlowLangError(message)
    return values as string[]
  }

  private toTable(value: Value, message: string): TableValue {
    if (!this.isTable(value)) throw new FlowLangError(message)
    return value
  }

  private toColumnName(value: Value): string {
    if (typeof value !== 'string') throw new FlowLangError('Column names need to be text.')
    return value
  }

  private toPrimitive(value: Value): PrimitiveValue {
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') return value
    throw new FlowLangError('Tables can only store text, numbers, or booleans in each cell.')
  }

  private toNumber(value: Value): number {
    if (typeof value !== 'number') throw new FlowLangError('This operation needs a number.')
    return value
  }

  private sumNumbers(value: Value): number {
    return this.sumArray(this.toNumberArray(value, 'sum() needs a numeric list or series.'))
  }

  private sumArray(values: number[]): number {
    return values.reduce((total, entry) => total + entry, 0)
  }

  private ensureNumber(value: Value, message: string): asserts value is number {
    if (typeof value !== 'number') throw new FlowLangError(message)
  }

  private withNumbers<T>(left: Value, right: Value, message: string, operation: (left: number, right: number) => T): T {
    if (typeof left !== 'number' || typeof right !== 'number') throw new FlowLangError(message)
    return operation(left, right)
  }

  private stringify(value: Value): string {
    if (Array.isArray(value)) return `[${value.map((item) => this.stringify(item)).join(', ')}]`
    if (this.isSeries(value)) return `series(${value.values.join(', ')})`
    if (this.isTable(value)) {
      const rows = value.rows
        .slice(0, 4)
        .map((row) => value.columns.map((column) => `${column}: ${row[column]}`).join(', '))
        .join(' | ')
      return `table(${rows}${value.rows.length > 4 ? ' ...' : ''})`
    }
    return String(value)
  }

  private isTruthy(value: Value): boolean {
    if (Array.isArray(value)) return value.length > 0
    if (this.isSeries(value)) return value.values.length > 0
    if (this.isTable(value)) return value.rows.length > 0
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    return value.length > 0
  }
}
