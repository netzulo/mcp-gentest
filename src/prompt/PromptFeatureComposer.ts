import { config } from 'dotenv'
config()

import fs from 'fs/promises'
import path from 'path'
import { OpenAI } from 'openai'
import { LLMContextFile } from '../analyzer/CodeContextBuilder.js'
import { stripCodeBlock } from '../utils/cleanMarkdown.js'


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const FEATURE_DIR = './cucumber/features'

function createPrompt(component: LLMContextFile): string {
  return `
Actúa como un experto en automatización de calidad con Cucumber y Selenium.

Analiza el siguiente componente de React y genera un archivo Cucumber (.feature) que cubra al menos:

- Un escenario de éxito
- Un escenario de fallo o borde
- Acciones del usuario
- Validaciones visibles

Responde solo con el contenido del archivo .feature sin explicaciones.

Archivo: ${component.path}

\`\`\`tsx
${component.code}
\`\`\`
`
}

export async function generateFeature(context: LLMContextFile): Promise<void> {
  const prompt = createPrompt(context)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Eres un generador de pruebas funcionales en Cucumber.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  })

  const featureText = completion.choices[0].message.content?.trim()
  const cleanFeature = featureText ? stripCodeBlock(featureText) : null

  if (!cleanFeature) {
    console.warn(`❌ No se pudo generar feature para ${context.path}`)
    return
  }

  const safeName = path.basename(context.path).replace(/\.[jt]sx?$/, '')
  const outPath = path.join(FEATURE_DIR, `${safeName}.feature`)

  await fs.mkdir(FEATURE_DIR, { recursive: true })
  await fs.writeFile(outPath, cleanFeature, 'utf-8')

  console.log(`✅ Feature guardado en: ${outPath}`)
}
