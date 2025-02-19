import { join } from 'node:path'
import { cwd } from 'node:process'
import { readFileSync, writeFileSync } from 'node:fs'
import fg from 'fast-glob'
import type { CodeItem, OptionsResolved, RouteItem } from '../types'
import { parseCode, traverseCode } from './codeAuthParser'
import { generateProjectCodeAuths } from './authConfigGenerator'
import { parseVue } from './vueRouteParser'

export class CodeScanner {
  private pageCodeAuths = new Map<string, CodeItem[]>()
  private dependencies = new Map<string, string[]>()
  private routes = new Map<string, RouteItem>()

  constructor(private readonly options: OptionsResolved) {}

  scan(): this {
    const files = fg.globSync(this.options.include, {
      ignore: this.options.exclude,
    })

    files.forEach(file => this.scanFile(file))
    return this
  }

  private scanFile(filePath: string): void {
    const id = join(cwd(), filePath)
    const code = readFileSync(id, 'utf-8')

    if (filePath.endsWith('.vue')) {
      const { content, routeItem } = parseVue(code)
      if (routeItem) {
        this.routes.set(id, routeItem)
      }
      this.processCode(content, id)
    }
    else {
      this.processCode(code, id)
    }
  }

  private processCode(code: string, id: string): void {
    const ast = parseCode(code)
    const { currentPageCodeAuths, currentDependencies } = traverseCode(ast, code, id, this.options)

    this.pageCodeAuths.set(id, currentPageCodeAuths)
    this.dependencies.set(id, currentDependencies)
  }

  getResults(): string {
    const auths = generateProjectCodeAuths(
      this.pageCodeAuths,
      this.dependencies,
      this.routes,
    )
    return JSON.stringify(Object.fromEntries(auths), null, 2)
  }

  writeToFile(): this {
    writeFileSync(this.options.codeFilePath, this.getResults())
    return this
  }
}
