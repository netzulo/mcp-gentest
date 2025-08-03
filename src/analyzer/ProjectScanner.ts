import fs from 'fs'
import path from 'path'

export class ProjectScanner {
  private extensions = ['.tsx', '.jsx']
  private excludeDirs = ['node_modules', '.next', 'dist', '__tests__', 'storybook', '.git']

  async scan(rootPath: string): Promise<string[]> {
    console.log('🧭 Escaneando ruta:', rootPath)
    const files: string[] = []
    const walk = async (dir: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (!this.excludeDirs.includes(entry.name)) await walk(fullPath)
        } else if (this.extensions.includes(path.extname(entry.name))) {
          files.push(fullPath)
        }
      }
    }
    await walk(rootPath)
    return files
  }
}
