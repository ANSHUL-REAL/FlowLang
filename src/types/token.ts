export type TokenType =
  | 'LET'
  | 'SAY'
  | 'IF'
  | 'REPEAT'
  | 'FOR'
  | 'IN'
  | 'FUNC'
  | 'CREATE'
  | 'ID'
  | 'SET_TEXT'
  | 'ON_CLICK'
  | 'STYLE'
  | 'INPUT'
  | 'AND'
  | 'OR'
  | 'TRUE'
  | 'FALSE'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'EQUAL'
  | 'EQUAL_EQUAL'
  | 'BANG_EQUAL'
  | 'LESS'
  | 'LESS_EQUAL'
  | 'GREATER'
  | 'GREATER_EQUAL'
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'DOT_DOT'
  | 'COMMA'
  | 'LEFT_PAREN'
  | 'RIGHT_PAREN'
  | 'LEFT_BRACE'
  | 'RIGHT_BRACE'
  | 'LEFT_BRACKET'
  | 'RIGHT_BRACKET'
  | 'EOF'

export interface Token {
  type: TokenType
  lexeme: string
  literal?: string | number | boolean
  line: number
  column: number
}
