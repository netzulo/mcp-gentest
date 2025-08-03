import fs from 'fs/promises'
import path from 'path'

export interface LLMContextFile {
  path: string
  code: string
  tokens?: number // futuro uso si queremos limitar por tamaño
}

export class CodeContextBuilder {
  async build(paths: string[]): Promise<LLMContextFile[]> {
    const results: LLMContextFile[] = []

    for (const filePath of paths) {
      try {
        const code = await fs.readFile(filePath, 'utf-8')

        // Evitar incluir archivos vacíos o irrelevantes
        if (code.length < 20) continue

        results.push({
          path: path.relative(process.cwd(), filePath),
          code: code.trim(),
        })
      } catch (e) {
        console.warn(`⚠️ No se pudo leer el archivo: ${filePath}`)
      }
    }

    return results
  }
}
