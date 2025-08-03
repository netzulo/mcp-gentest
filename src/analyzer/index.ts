import { ProjectScanner } from './ProjectScanner.js'
import { CodeContextBuilder } from './CodeContextBuilder.js'
import { parseCLIArgs } from '../utils/parseArgs.js'

export async function runAnalyzeCLI() {
  const args = await parseCLIArgs()
  console.log('📦 Args:', args)

  const scanner = new ProjectScanner()
  const builder = new CodeContextBuilder()

  const paths = await scanner.scan(args.project)
  const context = await builder.build(paths)

  console.log(`🧠 Archivos relevantes encontrados: ${context.length}`)
  console.log(context.slice(0, 2))
}

runAnalyzeCLI()
