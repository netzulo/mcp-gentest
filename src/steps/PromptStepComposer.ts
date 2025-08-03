import { config } from 'dotenv'
config()

import fs from 'fs/promises'
import { OpenAI } from 'openai'
import { stripCodeBlock } from '../utils/cleanMarkdown.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateSteps(featurePath: string): Promise<string | null> {
  const content = await fs.readFile(featurePath, 'utf-8')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You generate step definitions in modern TypeScript for automated tests using Cucumber and Selenium WebDriver. Your output must be clean TypeScript code only, no explanations or comments.',
      },
      {
        role: 'user',
        content: `
Given the following .feature file, generate a complete .steps.ts file.

Instructions:
- Use modern TypeScript and Selenium WebDriver (not Protractor).
- Assume "driver" is imported from "../support/webdriver".
- Do NOT use or reference any "pageObjects".
- Use "By.css", "driver.findElement", etc.
- Avoid "await" on non-async functions.
- Import only necessary functions from "cucumber" and "selenium-webdriver".
- Output ONLY the code (no explanations or markdown formatting).
- Include the following import at the top:

import { driver } from '../support/webdriver';

Here is the .feature content:

\`\`\`gherkin
${content}
\`\`\`
`.trim(),
      },
    ],
    temperature: 0.2,
  })


  const stepsCode = completion.choices[0].message.content?.trim()
  const cleanStepsCode = stepsCode ? stripCodeBlock(stepsCode) : null
  if (!cleanStepsCode) {
    console.warn(`❌ No se pudo generar steps para ${featurePath}`)
    return null
  }
  return cleanStepsCode
}
