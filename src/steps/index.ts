import { runStepBatch } from './BatchStepGenerator.js'
import { parseCLIArgs } from '../utils/parseArgs.js'

async function runStepCLI() {
  const args = await parseCLIArgs()
  await runStepBatch([
    args.project ?? './cucumber/features'
  ])
}

runStepCLI()
