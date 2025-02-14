import { writeFileSync } from 'node:fs'
import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import type { DependencyGraph, Options, ProjectPageCodeAuths, ProjectPageRoute } from './types'
import { resolveOptions } from './types'
import { generateProjectCodeAuths, parseCode, parseVue, traverseCode } from './core'

const projectPageCodeAuths: ProjectPageCodeAuths = {}
const projectDependencyGraph: DependencyGraph = {}
const projectRouteItems: ProjectPageRoute = {}

// 最终生成的应该是已前端每个vue页面的地址为key，value是该页面的路由信息和权限配置

export const unpluginFactory: UnpluginFactory<Options | undefined> = (rawOptions = {}) => {
  const options = resolveOptions(rawOptions)
  const filter = createFilter(options.include, options.exclude)
  return {
    name: 'unplugin-ha-code-auth',
    enforce: options.enforce,
    transformInclude(id) {
      return filter(id)
    },
    transform(code, id) {
      let scriptCode = code
      if (id.endsWith('.vue')) {
        const parseVueData = parseVue(scriptCode)

        if (!parseVueData) {
          return scriptCode
        }
        scriptCode = parseVueData.content
        if (parseVueData.routeItem) {
          projectRouteItems[id] = parseVueData.routeItem
        }
      }
      const ast = parseCode(scriptCode)
      const { currentPageCodeAuths, currentDependencies } = traverseCode(ast, scriptCode, id, options)
      projectPageCodeAuths[id] = currentPageCodeAuths
      projectDependencyGraph[id] = currentDependencies
      return scriptCode
    },
    buildEnd() {
      setTimeout(() => {
        writeFileSync(
          options.codeFilePath,
          JSON.stringify(generateProjectCodeAuths(projectPageCodeAuths, projectDependencyGraph, projectRouteItems), null, 2),
        )
      }, 10)
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
