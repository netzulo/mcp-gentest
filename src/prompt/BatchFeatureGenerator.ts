import { ProjectScanner } from '../analyzer/ProjectScanner.js'
import { CodeContextBuilder } from '../analyzer/CodeContextBuilder.js'
import { generateFeature } from './PromptFeatureComposer.js'

import fs from 'fs/promises'
import path from 'path'

export interface Options {
  projectPath: string
  include?: string
  limit?: number
  overwrite?: boolean
}

export async function runBatch(options: Options) {
  const scanner = new ProjectScanner()
  const builder = new CodeContextBuilder()

  let filePaths = await scanner.scan(options.projectPath)

  if (options.include) {
    filePaths = filePaths.filter(f => f.includes(options.include || ''))
  }

  if (options.limit) {
    filePaths = filePaths.slice(0, options.limit)
  }

  const contextFiles = await builder.build(filePaths)

  for (const ctx of contextFiles) {
    const safeName = path.basename(ctx.path).replace(/\.[jt]sx?$/, '')
    const outPath = path.join('cucumber/features', `${safeName}.feature`)

    try {
      if (!options.overwrite) {
        await fs.access(outPath)
        console.log(`⏩ Skip (ya existe): ${outPath}`)
        continue
      }
    } catch {
      // no existe
    }

    console.log(`📄 Generando feature para: ${ctx.path}`)
    await generateFeature(ctx)
  }
}
