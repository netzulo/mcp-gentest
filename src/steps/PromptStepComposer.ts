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
        content: 'Generas step definitions en TypeScript para pruebas automatizadas con Cucumber y Selenium WebDriver. El código debe ser limpio y sin explicaciones.',
      },
      {
        role: 'user',
        content: `
Dado el siguiente archivo .feature, genera su archivo .steps.ts correspondiente.

Instrucciones:
- Usa solo TypeScript moderno.
- Usa Selenium WebDriver. No uses Protractor.
- No declares el objeto "driver", asume que ya existe.
- Evita "await" sobre funciones que no devuelven una Promise.
- Usa "By.css", "driver.findElement", "driver.findElements", etc.
- Importa solo lo necesario desde "cucumber" y "selenium-webdriver".
- No generes comentarios, texto adicional ni explicaciones.

Contenido del archivo:

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
