import { spawn, ChildProcessWithoutNullStreams, execSync } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import net from 'net'
import http from 'http'

export interface WebServerOptions {
  projectRoot: string
  preferredPort?: number
  preferredScript?: string // e.g., 'dev', 'start', 'preview'
  testUrlEnvVar?: string // e.g., 'TEST_BASE_URL'
  waitPath?: string // default: '/'
  timeoutMs?: number // default: 20000
}

export class WebServerLauncher {
  private child: ChildProcessWithoutNullStreams | null = null

  async launch(options: WebServerOptions): Promise<{ url: string }> {
    const {
      projectRoot,
      preferredPort,
      preferredScript = 'dev',
      testUrlEnvVar = 'TEST_BASE_URL',
      waitPath = '/',
      timeoutMs = 20000,
    } = options

    const pkgPath = path.join(projectRoot, 'package.json')
    const pkgExists = await fs.access(pkgPath).then(() => true).catch(() => false)

    if (!pkgExists) {
      throw new Error(`No package.json found in ${projectRoot}`)
    }

    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
    const scripts = pkg.scripts || {}
    const scriptToUse = scripts[preferredScript] ? preferredScript : (scripts.start ? 'start' : null)

    if (!scriptToUse) {
      throw new Error(`No suitable start script found in package.json (looked for '${preferredScript}' or 'start')`)
    }

    const port = preferredPort || await this.findFreePort()
    const url = `http://localhost:${port}${waitPath}`

    this.child = spawn('npm', ['run', scriptToUse], {
      cwd: projectRoot,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: port.toString(),
      },
    })

    await this.waitForServer(url, timeoutMs)

    if (testUrlEnvVar) {
      process.env[testUrlEnvVar] = `http://localhost:${port}`
    }

    return { url: `http://localhost:${port}` }
  }

  private async findFreePort(start = 3000, end = 3999): Promise<number> {
    for (let port = start; port <= end; port++) {
      if (await this.isPortFree(port)) return port
    }
    throw new Error('No available port found')
  }

  private isPortFree(port: number): Promise<boolean> {
    return new Promise(resolve => {
      const tester = net.createServer()
        .once('error', () => resolve(false))
        .once('listening', () => {
          tester.close()
          resolve(true)
        })
        .listen(port)
    })
  }

  private async waitForServer(url: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      try {
        const isUp = await this.pingHttp(url)
        if (isUp) return
      } catch { /* ignore */ }
      await new Promise(res => setTimeout(res, 500))
    }
    throw new Error(`Timeout: Server not available at ${url} after ${timeoutMs}ms`)
  }

  private pingHttp(url: string): Promise<boolean> {
    return new Promise(resolve => {
      http.get(url, res => resolve(res.statusCode === 200))
        .on('error', () => resolve(false))
        .end()
    })
  }

  async stop(): Promise<void> {
    if (this.child) {
      const pid = this.child.pid
      console.log('🛑 Killing process tree for PID', pid)

      if (process.platform !== 'win32') {
        try {
          execSync(`pgrep -P ${pid}`)
            .toString()
            .split('\n')
            .forEach(subPid => {
              if (subPid.trim()) {
                execSync(`kill -TERM ${subPid}`)
              }
            })
        } catch (err) {
          console.warn('No child processes to kill or failed to kill:', (err as Error).message)
        }
      }

      this.child.kill('SIGTERM')
      this.child = null
      console.log('✅ Dev server fully terminated')
    }
  }
}
