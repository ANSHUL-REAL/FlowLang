import type { Expression, Program, Statement } from '../types/ast'
import type { Token, TokenType } from '../types/token'
import { FlowLangError } from './errors'

export function parse(tokens: Token[]): Program {
  return new Parser(tokens).parse()
}

class Parser {
  private current = 0

  constructor(private readonly tokens: Token[]) {}

  parse(): Program {
    const body: Statement[] = []
    while (!this.isAtEnd()) {
      body.push(this.statement())
    }
    return { type: 'Program', body }
  }

  private statement(): Statement {
    if (this.match('LET')) return this.letStatement()
    if (this.match('SAY')) return this.sayStatement()
    if (this.match('IF')) return this.ifStatement()
    if (this.match('REPEAT')) return this.repeatStatement()
    if (this.match('FOR')) return this.forStatement()
    if (this.match('FUNC')) return this.functionStatement()
    if (this.match('CREATE')) return this.createElementStatement()
    if (this.match('SET_TEXT')) return this.setTextStatement()
    if (this.match('ON_CLICK')) return this.onClickStatement()
    if (this.match('STYLE')) return this.styleStatement()
    if (this.match('INPUT')) return this.inputStatement()

    return this.expressionStatement()
  }

  private letStatement(): Statement {
    const name = this.consume('IDENTIFIER', 'Expected a variable name after let.')
    this.consume('EQUAL', "Expected '=' after the variable name.")
    return {
      type: 'LetStatement',
      name: name.lexeme,
      initializer: this.expression(),
    }
  }

  private sayStatement(): Statement {
    return {
      type: 'SayStatement',
      expression: this.expression(),
    }
  }

  private ifStatement(): Statement {
    const condition = this.expression()
    return { type: 'IfStatement', condition, body: this.block("Expected '{' after the if condition.") }
  }

  private repeatStatement(): Statement {
    const count = this.expression()
    return { type: 'RepeatStatement', count, body: this.block("Expected '{' after the repeat count.") }
  }

  private forStatement(): Statement {
    const name = this.consume('IDENTIFIER', 'Expected a loop variable after for.')
    this.consume('IN', "Expected 'in' after the loop variable.")
    const iterable = this.expression()
    return { type: 'ForStatement', name: name.lexeme, iterable, body: this.block("Expected '{' after the loop source.") }
  }

  private functionStatement(): Statement {
    const name = this.consume('IDENTIFIER', 'Expected a function name after func.')
    this.consume('LEFT_PAREN', "Expected '(' after the function name.")
    const params: string[] = []
    if (!this.check('RIGHT_PAREN')) {
      do {
        params.push(this.consume('IDENTIFIER', 'Expected a parameter name.').lexeme)
      } while (this.match('COMMA'))
    }
    this.consume('RIGHT_PAREN', "Expected ')' after function parameters.")
    return { type: 'FunctionStatement', name: name.lexeme, params, body: this.block("Expected '{' before the function body.") }
  }

  private createElementStatement(): Statement {
    const tag = this.expression()
    this.consume('ID', "Expected 'id' after the element tag.")
    const id = this.consume('IDENTIFIER', 'Expected a UI element id.')
    return { type: 'CreateElementStatement', tag, id: id.lexeme }
  }

  private setTextStatement(): Statement {
    const id = this.consume('IDENTIFIER', 'Expected an element id after setText.')
    const text = this.expression()
    return { type: 'SetTextStatement', id: id.lexeme, text }
  }

  private onClickStatement(): Statement {
    const id = this.consume('IDENTIFIER', 'Expected an element id after onClick.')
    return { type: 'OnClickStatement', id: id.lexeme, body: this.block("Expected '{' before the click handler body.") }
  }

  private styleStatement(): Statement {
    const id = this.consume('IDENTIFIER', 'Expected an element id after style.')
    this.consume('LEFT_BRACE', "Expected '{' before the style block.")

    const styles: Array<{ property: string; value: string | number }> = []
    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
      const property = this.consume('IDENTIFIER', 'Expected a style property name.').lexeme
      styles.push({ property, value: this.styleValue() })
    }

    this.consume('RIGHT_BRACE', "Expected '}' to close the style block.")
    return { type: 'StyleStatement', id: id.lexeme, styles }
  }

  private styleValue(): string | number {
    if (this.match('NUMBER')) return this.previous().literal as number
    if (this.match('STRING')) return this.previous().literal as string
    if (this.match('IDENTIFIER')) return this.previous().lexeme
    throw this.error(this.peek(), 'Expected a style value like blue, 10, or "12px".')
  }

  private inputStatement(): Statement {
    const name = this.consume('IDENTIFIER', 'Expected a variable name after input.')
    return { type: 'InputStatement', name: name.lexeme, prompt: this.expression() }
  }

  private expressionStatement(): Statement {
    return { type: 'ExpressionStatement', expression: this.expression() }
  }

  private block(message: string): Statement[] {
    this.consume('LEFT_BRACE', message)
    const body: Statement[] = []
    while (!this.check('RIGHT_BRACE') && !this.isAtEnd()) {
      body.push(this.statement())
    }
    this.consume('RIGHT_BRACE', "Expected '}' to close the block.")
    return body
  }

  private expression(): Expression {
    return this.range()
  }

  private range(): Expression {
    let expression = this.logicOr()
    if (this.match('DOT_DOT')) {
      expression = { type: 'RangeExpression', start: expression, end: this.logicOr() }
    }
    return expression
  }

  private logicOr(): Expression {
    let expr = this.logicAnd()

    while (this.match('OR')) {
      const operator = this.previous().lexeme
      const right = this.logicAnd()
      expr = { type: 'BinaryExpression', left: expr, operator, right }
    }

    return expr
  }

  private logicAnd(): Expression {
    let expr = this.equality()

    while (this.match('AND')) {
      const operator = this.previous().lexeme
      const right = this.equality()
      expr = { type: 'BinaryExpression', left: expr, operator, right }
    }

    return expr
  }

  private equality(): Expression {
    let expr = this.comparison()

    while (this.match('BANG_EQUAL', 'EQUAL_EQUAL')) {
      const operator = this.previous().lexeme
      const right = this.comparison()
      expr = { type: 'BinaryExpression', left: expr, operator, right }
    }

    return expr
  }

  private comparison(): Expression {
    let expr = this.term()

    while (this.match('GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL')) {
      const operator = this.previous().lexeme
      const right = this.term()
      expr = { type: 'BinaryExpression', left: expr, operator, right }
    }

    return expr
  }

  private term(): Expression {
    let expr = this.factor()

    while (this.match('MINUS', 'PLUS')) {
      const operator = this.previous().lexeme
      const right = this.factor()
      expr = { type: 'BinaryExpression', left: expr, operator, right }
    }

    return expr
  }

  private factor(): Expression {
    let expr = this.unary()

    while (this.match('SLASH', 'STAR')) {
      const operator = this.previous().lexeme
      const right = this.unary()
      expr = { type: 'BinaryExpression', left: expr, operator, right }
    }

    return expr
  }

  private unary(): Expression {
    if (this.match('MINUS')) {
      const operator = this.previous().lexeme
      const right = this.unary()
      return { type: 'UnaryExpression', operator, right }
    }

    return this.call()
  }

  private call(): Expression {
    let expression = this.primary()

    if (this.match('LEFT_PAREN')) {
      if (expression.type !== 'IdentifierExpression') {
        throw this.error(this.previous(), 'Only named functions can be called.')
      }

      const args: Expression[] = []
      if (!this.check('RIGHT_PAREN')) {
        do {
          args.push(this.expression())
        } while (this.match('COMMA'))
      }
      this.consume('RIGHT_PAREN', "Expected ')' after function arguments.")
      expression = { type: 'CallExpression', callee: expression.name, args }
    }

    return expression
  }

  private primary(): Expression {
    if (this.match('NUMBER', 'STRING', 'TRUE', 'FALSE')) {
      return { type: 'LiteralExpression', value: this.previous().literal as number | string | boolean }
    }

    if (this.match('IDENTIFIER')) {
      return { type: 'IdentifierExpression', name: this.previous().lexeme }
    }

    if (this.match('LEFT_BRACKET')) {
      const items: Expression[] = []
      if (!this.check('RIGHT_BRACKET')) {
        do {
          items.push(this.expression())
        } while (this.match('COMMA'))
      }
      this.consume('RIGHT_BRACKET', "Expected ']' after the list.")
      return { type: 'ListExpression', items }
    }

    if (this.match('LEFT_PAREN')) {
      const expression = this.expression()
      this.consume('RIGHT_PAREN', "Expected ')' after the expression.")
      return { type: 'GroupingExpression', expression }
    }

    throw this.error(this.peek(), 'Expected a number, string, variable, list, function call, or grouped expression.')
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance()
    throw this.error(this.peek(), message)
  }

  private check(type: TokenType): boolean {
    return !this.isAtEnd() && this.peek().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current += 1
    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF'
  }

  private peek(): Token {
    return this.tokens[this.current]
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }

  private error(token: Token, message: string): FlowLangError {
    return new FlowLangError(message, token.line, token.column)
  }
}
