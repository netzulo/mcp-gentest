import { parseCLIArgs } from '../utils/parseArgs.js'
import { runBatch } from './BatchFeatureGenerator.js'

export async function runBatchCLI() {
  const args = await parseCLIArgs()
  console.log('📦 Args:', args)

  await runBatch({
    projectPath: args.project,
    include: args.include,
    limit: args.limit,
    overwrite: args.overwrite,
  })
}

runBatchCLI()
