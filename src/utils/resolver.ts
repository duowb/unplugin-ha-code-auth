import { existsSync, statSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { cwd } from 'node:process'
import type { OptionsResolved } from '../types'

// 类型定义
type ResolveResult = string | null

interface AliasConfig {
  prefix: string
  targetPath: string
}

type PathType = 'relative' | 'absolute' | 'alias' | 'node_module'

// 缓存对象
const pathCache = {
  alias: new Map<string, ResolveResult>(),
  nodeModule: new Map<string, ResolveResult>(),
  clear: () => {
    pathCache.alias.clear()
    pathCache.nodeModule.clear()
  },
}

/**
 * 判断路径类型
 * @param path 请求路径
 * @param aliasConfigs 别名配置
 */
function getPathType(path: string, aliasConfigs: AliasConfig[]): PathType {
  if (path.startsWith('./') || path.startsWith('../'))
    return 'relative'
  if (isAbsolute(path))
    return 'absolute'
  if (aliasConfigs.some(({ prefix }) => path.startsWith(`${prefix}/`))) {
    return 'alias'
  }
  return 'node_module'
}

/**
 * 尝试解析不同扩展名的文件
 * @param path 基础路径
 */
function tryExtensions(path: string): ResolveResult {
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue']

  // 检查原始路径
  if (existsSync(path) && statSync(path).isFile()) {
    return path
  }

  // 尝试添加扩展名
  for (const ext of extensions) {
    const pathWithExt = `${path}${ext}`
    if (existsSync(pathWithExt) && statSync(pathWithExt).isFile()) {
      return pathWithExt
    }
  }

  // 检查是否为目录并查找 index 文件
  if (existsSync(path) && statSync(path).isDirectory()) {
    for (const ext of extensions) {
      const indexPath = resolve(path, `index${ext}`)
      if (existsSync(indexPath) && statSync(indexPath).isFile()) {
        return indexPath
      }
    }
  }

  return null
}

/**
 * 解析相对路径
 */
function resolveRelative(basePath: string, requestPath: string): ResolveResult {
  const baseDir = resolve(basePath, '..')
  return tryExtensions(resolve(baseDir, requestPath))
}

/**
 * 解析绝对路径
 */
function resolveAbsolute(_: string, requestPath: string): ResolveResult {
  return tryExtensions(requestPath)
}

/**
 * 解析别名路径
 */
function resolveAlias(aliasConfigs: AliasConfig[]) {
  return (_: string, requestPath: string): ResolveResult => {
    // 检查缓存
    const cached = pathCache.alias.get(requestPath)
    if (cached !== undefined)
      return cached

    const matchedAlias = aliasConfigs.find(({ prefix }) =>
      requestPath.startsWith(`${prefix}/`),
    )
    if (matchedAlias) {
      const relativePath = requestPath.slice(matchedAlias.prefix.length + 1)
      const fullPath = `${matchedAlias.targetPath}/${relativePath}`
      const resolvedPath = tryExtensions(fullPath)
      // 缓存结果
      pathCache.alias.set(requestPath, resolvedPath)
      return resolvedPath
    }
    return null
  }
}

/**
 * 解析 node_modules 包
 */
function resolveNodeModule(_: string, requestPath: string): ResolveResult {
  // 检查缓存
  const cached = pathCache.nodeModule.get(requestPath)
  if (cached !== undefined)
    return cached

  // 直接检查项目根目录的 node_modules
  const modulePath = resolve(cwd(), 'node_modules', requestPath)
  const result = existsSync(modulePath) ? modulePath : null

  // 缓存结果
  pathCache.nodeModule.set(requestPath, result)
  return result
}

/**
 * 路径解析主函数
 * @param basePath 基础路径（当前文件路径）
 * @param requestPath 请求路径
 * @param options 选项
 * @returns 解析结果
 */
export function customResolvePath(
  basePath: string,
  requestPath: string,
  options: OptionsResolved,
): ResolveResult {
  const { aliasConfigs, ignoreFiles } = options
  const resolvers = {
    relative: resolveRelative,
    absolute: resolveAbsolute,
    alias: resolveAlias(aliasConfigs),
    node_module: resolveNodeModule,
  }

  const pathType = getPathType(requestPath, aliasConfigs)
  const result = resolvers[pathType](basePath, requestPath)
  if (!result)
    return null
  if (ignoreFiles.some(ignoreFile => result.includes(ignoreFile)))
    return null
  return result
}

// 导出缓存清理函数
export function clearPathCache(): void {
  pathCache.clear()
}
