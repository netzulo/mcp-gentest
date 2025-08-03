import { Cli } from '@cucumber/cucumber'
import path from 'path'

export interface CucumberLauncherOptions {
  projectRoot?: string
  featureGlob?: string
  requireGlob?: string
  tags?: string
  format?: string
}

export class CucumberLauncher {
  async run(options?: CucumberLauncherOptions): Promise<void> {
    const {
      projectRoot = process.cwd(),
      featureGlob = 'cucumber/features/**/*.feature',
      requireGlob = 'dist-cucumber/step_definitions/**/*.js',
      tags,
      format = 'progress',
    } = options || {}

    const argv = [
      'node', 'cucumber-js',
      featureGlob,
      '--require', requireGlob,
      '--format', format,
      ...(tags ? ['--tags', tags] : []),
    ]

    const cli = new Cli({
      argv,
      cwd: projectRoot,
      stdout: process.stdout,
      stderr: process.stderr,
      env: process.env,
    })

    const success = await cli.run()
    if (!success) throw new Error('❌ Cucumber tests failed')
  }
}
