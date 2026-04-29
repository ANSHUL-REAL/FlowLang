# FlowLang Runtime Notes

FlowLang runs through a local compiler-style pipeline:

1. Lexer: source text becomes tokens.
2. Parser: tokens become an AST.
3. Interpreter: the AST produces output, data artifacts, and Visual DOM nodes.
4. Visual DOM: UI commands render into a safe preview tree.

## Current Language Surface

- Variables: `let score = 10`
- Output: `say score`
- Conditions: `if score > 5 { say "ok" }`
- Loops: `repeat 3 { ... }`, `for i in 1..5 { ... }`
- Functions: `func greet(name) { say "Hello " + name }`
- Lists and ranges: `[1, 2, 3]`, `1..5`
- Series helpers: `mean`, `std`, `variance`, `percentile`, `linspace`, `normalize`
- Table helpers: `table`, `select`, `filterGt`, `filterLt`, `filterEq`, `filterBetween`, `sortBy`, `rename`, `describe`
- Safe UI: `create`, `setText`, `style`, `onClick`
