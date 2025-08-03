# 🧪 MCP GenTest

[![CI](https://github.com/your-username/mcp-gentest/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/mcp-gentest/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Node.js](https://img.shields.io/badge/node-%3E=18.x-brightgreen)

MCP GenTest is an LLM-powered tool that automatically generates Cucumber `.feature` files and `.steps.ts` test definitions from your React component code.

Ideal for QA teams who want to bridge UI components and automated functional tests with minimal manual effort.

---

## ✨ Features

- Scans your React project and extracts UI component logic
- Generates Cucumber `.feature` scenarios (success, edge, validation)
- Produces TypeScript step definitions using Selenium WebDriver
- Optional CLI test runner with full TypeScript support

---

## 🚀 Installation

```bash
git clone https://github.com/your-username/mcp-gentest.git
cd mcp-gentest
yarn install
cp .env.example .env
# Add your OpenAI API key to the .env file
```

---

## 🔧 Usage

### 1. Analyze project and generate features

```bash
yarn features --project ./path/to/react-project
```

Optional flags:
- `--include src/`: scan only files inside that folder
- `--limit 5`: analyze only the first 5 relevant files
- `--overwrite`: replace existing `.feature` files

### 2. Generate step definitions

```bash
yarn steps
```

This will create `.steps.ts` files inside `cucumber/step_definitions`.

### 3. Run tests

```bash
yarn test:run
```

Runs `cucumber-js` against the generated files using the transpiled JS output in `dist/`.

---

## 📂 Project Structure

```
cucumber/
  features/
    Button.feature
    Header.feature
  step_definitions/
    Button.steps.ts
    Header.steps.ts
```

---

## 📜 Available Scripts

```json
{
  "analyze": "tsc && node dist/analyzer/index.js",
  "features": "tsc && node dist/prompt/index.js",
  "steps": "tsc && node dist/steps/index.js",
  "test:run": "yarn build && cucumber-js dist/cucumber/features --require dist/cucumber/step_definitions/**/*.js",
  "build": "tsc"
}
```

---

## 🌍 Environment Variables

Create a `.env` file with your OpenAI API key:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📦 Requirements

- Node.js >= 18
- Yarn >= 1.22
- OpenAI API key (uses GPT-4o)
- React project with `.tsx` components

---

## 🛣️ Roadmap

- [x] Feature + step generator from component code
- [x] Unified CLI runner
- [x] Transpilation from TypeScript to CommonJS for Cucumber
- [ ] Support for Playwright/Testing Library
- [ ] GitHub Action for CI integration

---

## 🧪 Demo

```bash
yarn analyze:example
yarn features:example
yarn steps:example
yarn test:run
# or
yarn clean && yarn && yarn runner:example && yarn test:run
```

---

## 📄 License

This project is licensed under the MIT License.
