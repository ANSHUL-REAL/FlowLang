import type { Token, TokenType } from '../types/token'
import { FlowLangError } from './errors'

const keywords: Record<string, TokenType> = {
  let: 'LET',
  say: 'SAY',
  if: 'IF',
  repeat: 'REPEAT',
  for: 'FOR',
  in: 'IN',
  func: 'FUNC',
  create: 'CREATE',
  id: 'ID',
  setText: 'SET_TEXT',
  onClick: 'ON_CLICK',
  style: 'STYLE',
  input: 'INPUT',
  and: 'AND',
  or: 'OR',
  true: 'TRUE',
  false: 'FALSE',
}

export function lex(source: string): Token[] {
  const lexer = new Lexer(source)
  return lexer.scanTokens()
}

class Lexer {
  private readonly tokens: Token[] = []
  private start = 0
  private current = 0
  private line = 1
  private column = 1
  private startColumn = 1

  constructor(private readonly source: string) {}

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.startColumn = this.column
      this.scanToken()
    }

    this.tokens.push({
      type: 'EOF',
      lexeme: '',
      line: this.line,
      column: this.column,
    })
    return this.tokens
  }

  private scanToken(): void {
    const char = this.advance()

    switch (char) {
      case '(':
        this.addToken('LEFT_PAREN')
        break
      case ')':
        this.addToken('RIGHT_PAREN')
        break
      case '{':
        this.addToken('LEFT_BRACE')
        break
      case '}':
        this.addToken('RIGHT_BRACE')
        break
      case '+':
        this.addToken('PLUS')
        break
      case '-':
        this.addToken('MINUS')
        break
      case '*':
        this.addToken('STAR')
        break
      case '[':
        this.addToken('LEFT_BRACKET')
        break
      case ']':
        this.addToken('RIGHT_BRACKET')
        break
      case ',':
        this.addToken('COMMA')
        break
      case '.':
        if (this.match('.')) {
          this.addToken('DOT_DOT')
        } else {
          throw new FlowLangError("Did you mean '..'? FlowLang uses two dots for ranges like 1..5.", this.line, this.startColumn)
        }
        break
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance()
        } else {
          this.addToken('SLASH')
        }
        break
      case '=':
        this.addToken(this.match('=') ? 'EQUAL_EQUAL' : 'EQUAL')
        break
      case '!':
        if (this.match('=')) {
          this.addToken('BANG_EQUAL')
        } else {
          throw new FlowLangError("Did you mean '!='? FlowLang only uses ! for comparisons.", this.line, this.startColumn)
        }
        break
      case '<':
        this.addToken(this.match('=') ? 'LESS_EQUAL' : 'LESS')
        break
      case '>':
        this.addToken(this.match('=') ? 'GREATER_EQUAL' : 'GREATER')
        break
      case '"':
        this.string()
        break
      case ' ':
      case '\r':
      case '\t':
        break
      case '\n':
        this.line += 1
        this.column = 1
        break
      default:
        if (this.isDigit(char)) {
          this.number()
        } else if (this.isAlpha(char)) {
          this.identifier()
        } else {
          throw new FlowLangError(`FlowLang does not understand '${char}'.`, this.line, this.startColumn)
        }
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance()
    const text = this.source.slice(this.start, this.current)
    const type = keywords[text] ?? 'IDENTIFIER'
    if (type === 'TRUE') {
      this.addToken(type, true)
    } else if (type === 'FALSE') {
      this.addToken(type, false)
    } else {
      this.addToken(type)
    }
  }

  private number(): void {
    while (this.isDigit(this.peek())) this.advance()

    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance()
      while (this.isDigit(this.peek())) this.advance()
    }

    this.addToken('NUMBER', Number(this.source.slice(this.start, this.current)))
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line += 1
        this.column = 1
      }
      this.advance()
    }

    if (this.isAtEnd()) {
      throw new FlowLangError('This string is missing its closing quote.', this.line, this.startColumn)
    }

    this.advance()
    const value = this.source.slice(this.start + 1, this.current - 1)
    this.addToken('STRING', value)
  }

  private addToken(type: TokenType, literal?: string | number | boolean): void {
    const text = this.source.slice(this.start, this.current)
    this.tokens.push({
      type,
      lexeme: text,
      literal,
      line: this.line,
      column: this.startColumn,
    })
  }

  private advance(): string {
    const char = this.source[this.current]
    this.current += 1
    this.column += 1
    return char
  }

  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source[this.current] !== expected) return false
    this.current += 1
    this.column += 1
    return true
  }

  private peek(): string {
    return this.isAtEnd() ? '\0' : this.source[this.current]
  }

  private peekNext(): string {
    return this.current + 1 >= this.source.length ? '\0' : this.source[this.current + 1]
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9'
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_'
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char)
  }
}
