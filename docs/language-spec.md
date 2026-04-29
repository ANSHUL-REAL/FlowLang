# FlowLang Language Spec

FlowLang is intentionally small for v1.

## Variables

```flowlang
let x = 10
```

## Output

```flowlang
say x
say "hello"
```

## Expressions

```flowlang
let y = 5 + 3 * 2
```

Supported operators:

- arithmetic: `+`, `-`, `*`, `/`
- comparisons: `==`, `!=`, `<`, `<=`, `>`, `>=`
- grouping: `(5 + 3) * 2`

## Conditions

```flowlang
if x == 10 {
  say "Correct"
}
```

## Notes

FlowLang does not use JavaScript `eval()`. Programs run through the lexer, parser, and interpreter.
