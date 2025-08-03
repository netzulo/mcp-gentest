import { parseCLIArgs } from '../utils/parseArgs.js'
import { ProjectScanner } from '../analyzer/ProjectScanner.js'
import { CodeContextBuilder } from '../analyzer/CodeContextBuilder.js'
import { runBatch as runFeatureBatch } from '../prompt/BatchFeatureGenerator.js'
import { runStepBatch } from '../steps/BatchStepGenerator.js'
import { WebServerLauncher } from '../launchers/WebServerLauncher.js'
import fs from 'fs/promises'
import path from 'path'

export async function runRunner() {
  const args = await parseCLIArgs()
  console.log('📦 Args:', args)

  let webServer: WebServerLauncher | null = null

  if (args.serve) {
    console.log('🚀 Starting dev server...')
    webServer = new WebServerLauncher()
    try {
      const { url } = await webServer.launch({
        projectRoot: args.project,
        preferredScript: 'dev',
        preferredPort: 3000,
        testUrlEnvVar: 'TEST_BASE_URL',
        waitPath: '/',
        timeoutMs: 20000
      })
      console.log(`🌍 Dev server started at ${url}`)
    } catch (err) {
      console.error('❌ Failed to start dev server:', err)
      process.exit(1)
    }
  }

  const scanner = new ProjectScanner()
  const builder = new CodeContextBuilder()
  const files = await scanner.scan(args.project)
  const filtered = args.include ? files.filter(f => f.includes(args.include || '')) : files
  const limited = args.limit ? filtered.slice(0, args.limit) : filtered
  const context = await builder.build(limited)

  console.log(`🧠 Generando ${context.length} features...`)
  await runFeatureBatch({
    projectPath: args.project,
    include: args.include,
    limit: args.limit,
    overwrite: args.overwrite
  })

  const featurePaths = await fs.readdir('cucumber/features')
  const fullPaths = featurePaths
    .filter(f => f.endsWith('.feature'))
    .map(f => path.join('cucumber/features', f))

  console.log(`🔁 Generando steps para ${fullPaths.length} features...`)
  await runStepBatch(fullPaths, args.overwrite)

  if (webServer) {
    console.log('🛑 Stopping dev server...')
    await webServer.stop()
    console.log('✅ Dev server stopped.')
  }
}

runRunner()
