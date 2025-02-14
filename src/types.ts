import { join, resolve } from 'node:path'
import { cwd } from 'node:process'
import type { FilterPattern } from '@rollup/pluginutils'

export interface AliasConfig {
  /**
   * 别名前缀
   * @default '@' 或 '~'
   */
  prefix: string
  /**
   * 别名目标路径
   * @default resolve(cwd(), 'src')
   */
  targetPath: string
}

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  enforce?: 'pre' | 'post' | undefined
  /**
   * 代码文件路径
   * @default join(cwd(), 'projectCodePermissions.json')
   */
  codeFilePath?: string
  /**
   * 别名配置
   */
  aliasConfigs?: AliasConfig[]
  /**
   * 忽略的文件
   * @default ['node_modules', 'assets']
   */
  ignoreFiles?: string[]
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type OptionsResolved = Overwrite<
  Required<Options>,
  Pick<Options, 'enforce'>
>

export function resolveOptions(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.[cm]?[jt]sx?$|\.vue$/],
    exclude: options.exclude || [/node_modules/],
    enforce: 'enforce' in options ? options.enforce : 'pre',
    codeFilePath:
      options.codeFilePath || join(cwd(), 'projectCodePermissions.json'),
    aliasConfigs: options.aliasConfigs || [
      {
        prefix: '@',
        targetPath: resolve(cwd(), 'src'),
      },

      {
        prefix: '~',
        targetPath: resolve(cwd(), 'src'),
      },
    ],
    ignoreFiles: options.ignoreFiles || ['node_modules', 'assets'],
  }
}

export interface RouteItem {
  name: string
  path: string
  label: string
}

export interface CodeItem {
  code: string
  label: string
}

export type PartialCodeItem = Partial<CodeItem>

export interface ProjectPageCodeAuths {
  [pagePath: string]: CodeItem[]
}

export interface DependencyGraph {
  [pagePath: string]: string[]
}
export interface ProjectPageRoute {
  [pagePath: string]: RouteItem
}

export interface ProjectPageRouteAndCodeAuths {
  [pagePath: string]: {
    routeItem: RouteItem
    codeItems: CodeItem[]
  }
}

// 扩展 Module 类型
declare module 'webpack' {
  interface Module {
    resource: string
  }
}

// 定义递归的 I18nValue 类型
export type I18nValue = string | {
  [key: string]: I18nValue
}
