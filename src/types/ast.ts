export type PrimitiveValue = number | string | boolean

export interface SeriesValue {
  kind: 'series'
  values: number[]
}

export interface TableValue {
  kind: 'table'
  columns: string[]
  rows: Array<Record<string, PrimitiveValue>>
}

export type Value = PrimitiveValue | Value[] | SeriesValue | TableValue

export type Statement =
  | LetStatement
  | SayStatement
  | IfStatement
  | RepeatStatement
  | ForStatement
  | FunctionStatement
  | ExpressionStatement
  | CreateElementStatement
  | SetTextStatement
  | OnClickStatement
  | StyleStatement
  | InputStatement

export interface Program {
  type: 'Program'
  body: Statement[]
}

export interface LetStatement {
  type: 'LetStatement'
  name: string
  initializer: Expression
}

export interface SayStatement {
  type: 'SayStatement'
  expression: Expression
}

export interface IfStatement {
  type: 'IfStatement'
  condition: Expression
  body: Statement[]
}

export interface RepeatStatement {
  type: 'RepeatStatement'
  count: Expression
  body: Statement[]
}

export interface ForStatement {
  type: 'ForStatement'
  name: string
  iterable: Expression
  body: Statement[]
}

export interface FunctionStatement {
  type: 'FunctionStatement'
  name: string
  params: string[]
  body: Statement[]
}

export interface ExpressionStatement {
  type: 'ExpressionStatement'
  expression: Expression
}

export interface CreateElementStatement {
  type: 'CreateElementStatement'
  tag: Expression
  id: string
}

export interface SetTextStatement {
  type: 'SetTextStatement'
  id: string
  text: Expression
}

export interface OnClickStatement {
  type: 'OnClickStatement'
  id: string
  body: Statement[]
}

export interface StyleStatement {
  type: 'StyleStatement'
  id: string
  styles: Array<{ property: string; value: string | number }>
}

export interface InputStatement {
  type: 'InputStatement'
  name: string
  prompt: Expression
}

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | LiteralExpression
  | IdentifierExpression
  | GroupingExpression
  | ListExpression
  | RangeExpression
  | CallExpression

export interface BinaryExpression {
  type: 'BinaryExpression'
  left: Expression
  operator: string
  right: Expression
}

export interface UnaryExpression {
  type: 'UnaryExpression'
  operator: string
  right: Expression
}

export interface LiteralExpression {
  type: 'LiteralExpression'
  value: Value
}

export interface IdentifierExpression {
  type: 'IdentifierExpression'
  name: string
}

export interface GroupingExpression {
  type: 'GroupingExpression'
  expression: Expression
}

export interface ListExpression {
  type: 'ListExpression'
  items: Expression[]
}

export interface RangeExpression {
  type: 'RangeExpression'
  start: Expression
  end: Expression
}

export interface CallExpression {
  type: 'CallExpression'
  callee: string
  args: Expression[]
}
