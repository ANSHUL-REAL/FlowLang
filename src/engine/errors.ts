export class FlowLangError extends Error {
  readonly line: number
  readonly column: number

  constructor(message: string, line = 1, column = 1) {
    super(message)
    this.name = 'FlowLangError'
    this.line = line
    this.column = column
  }
}
