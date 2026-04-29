# FlowLang

FlowLang is a browser-native language lab for learning how code works while also building small UI and data-driven apps.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current Runtime Features

- Variables, conditions, loops, and functions
- Safe UI rendering with a visual DOM preview
- Series helpers like `sum`, `mean`, `median`, `std`, `variance`, `percentile`, `normalize`, and `linspace`
- Table helpers like `table`, `select`, `filterGt`, `filterLt`, `filterEq`, `filterBetween`, `sortBy`, `rename`, and `describe`
- Downloadable language assets in `public/downloads`:
  - `flowlang-syntax.json`
  - `flowlang.tmLanguage.json`
  - `flowlang-starter.flow`
  - `flowlang-runtime-notes.md`

## Compiler Pipeline

FlowLang runs locally through:

```text
Source code -> Lexer -> Parser -> AST -> Interpreter -> Output / Data / Visual DOM
```

The playground exposes those stages so the language feels inspectable instead of like a black-box demo.

## Supabase Setup

The auth UI is wired for Supabase. Add these values before turning login on for real:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Without those values, the login screen stays in a safe pending state and explains what is missing.
