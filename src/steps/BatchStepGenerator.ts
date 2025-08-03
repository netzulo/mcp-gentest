import fs from 'fs/promises'
import path from 'path'
import { generateSteps } from './PromptStepComposer.js'

const STEP_DIR = 'cucumber/step_definitions'

export async function runStepBatch(featurePaths: string[], overwrite = false) {
  // Asegurar que la carpeta step_definitions existe
  await fs.mkdir(STEP_DIR, { recursive: true })

  for (const featurePath of featurePaths) {
    console.log(`🧪 Generando steps para: ${featurePath}`)
    const baseName = path.basename(featurePath).replace(/\.feature$/, '')
    const stepsPath = path.join(STEP_DIR, `${baseName}.steps.ts`)

    try {
      if (!overwrite) {
        await fs.access(stepsPath)
        console.log(`⏩ Skip (ya existe): ${stepsPath}`)
        continue
      }
    } catch {
      // File doesn't exist, continue to write
    }

    const stepsContent = await generateSteps(featurePath)
    if (stepsContent) {
      await fs.writeFile(stepsPath, stepsContent, 'utf8')
      console.log(`✅ Steps generados: ${stepsPath}`)
    } else {
      console.error(`❌ Error al generar steps para: ${featurePath}`)
    }
  }
}
