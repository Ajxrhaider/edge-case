# edge-case

**edge-case** is an AI-assisted test generator. Paste a function, component, or program to generate a copy-ready test file focused on branches, edge cases, and logic flows.

## Curated language and framework choices

- JavaScript and TypeScript: Vitest or Jest
- Python: pytest or unittest
- Go: standard `testing` package
- Java and Kotlin: JUnit 5
- C#: xUnit
- Rust: `cargo test`
- PHP: PHPUnit
- Ruby: RSpec
- C++: GoogleTest, Catch2, or doctest

## Custom languages and frameworks

Choose **Other / custom** to enter a language and test framework that are not in the curated list. You can also choose **Custom framework** for a curated language.

This lets the app attempt a broad range of languages and test runners, including ones not explicitly listed. It cannot guarantee support for literally every language, language version, proprietary dialect, or framework. The model may not know obscure conventions, so review and run generated tests in the target project before relying on them.

## Stack

- SvelteKit
- Svelte
- TypeScript
- Tailwind CSS
- Groq API for server-side AI requests

## Groq model

Groq retired its `deepseek-r1-distill-llama-70b` model. The server route defaults to `openai/gpt-oss-120b`, a supported Groq model. To use a different model, set `GROQ_MODEL` to an active model ID available to your Groq project.

## Requirements

- A currently supported Node.js LTS release (Node.js 22 or newer is recommended)
- npm
- A Groq account and API key

## Run locally

Install dependencies and start the development server:

```bash
npm install
npm run dev -- --open