import type { DependencyGraph, ProjectPageCodeAuths, ProjectPageRoute, ProjectPageRouteAndCodeAuths } from '../types'

// 递归向上查找依赖关系
function findDependencies(
  pagePath: string,
  projectDependencyGraph: DependencyGraph,
): string[] {
  const dependencies: string[] = []
  Object.entries(projectDependencyGraph).forEach(([key, values]) => {
    if (key === pagePath) {
      dependencies.push(...values)
      values.forEach((value) => {
        dependencies.push(...findDependencies(value, projectDependencyGraph))
      })
    }
  })
  return dependencies
}

function uniqueByKey<T>(arr: T[], key: keyof T): T[] {
  const map = new Map()
  arr.forEach((item) => {
    if (!map.has(item[key])) {
      map.set(item[key], item)
    }
  })
  return Array.from(map.values())
}

/**
 * 生成每个页面的权限配置
 * @param projectAuths 每个页面的权限配置，包含了js/ts/vue页面
 * @param projectDependencyGraph 项目依赖关系图
 * @param projectRouteItems 每个vue页面的路由信息
 */
export function generateProjectCodeAuths(
  projectAuths: ProjectPageCodeAuths,
  projectDependencyGraph: DependencyGraph,
  projectRouteItems: ProjectPageRoute,
): ProjectPageRouteAndCodeAuths {
  const newProjectPageCodeAuths: ProjectPageRouteAndCodeAuths = {}

  Object.entries(projectRouteItems).forEach(([pagePath, routeItem]) => {
    if (!routeItem.name && !routeItem.path && !routeItem.label) {
      return
    }
    const defaultCodeItems = projectAuths[pagePath]
    const dependencies = findDependencies(pagePath, projectDependencyGraph)
    dependencies.forEach((dependency) => {
      if (projectAuths[dependency]) {
        defaultCodeItems.push(...projectAuths[dependency])
      }
    })
    newProjectPageCodeAuths[pagePath] = {
      routeItem,
      codeItems: uniqueByKey(defaultCodeItems, 'code'),
    }
  })
  return newProjectPageCodeAuths
}
