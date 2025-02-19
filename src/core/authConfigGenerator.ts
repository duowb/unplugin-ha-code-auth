import type {
  CodeItem,
  DependencyGraphMap,
  ProjectPageCodeAuthsMap,
  ProjectPageRouteAndCodeAuthsMap,
  ProjectPageRouteMap,
  RouteItem,
} from '../types'

// 递归向上查找依赖关系
function findDependencies(
  pagePath: string,
  projectDependencyGraph: DependencyGraphMap,
): string[] {
  const dependencies = new Set<string>()

  function addDependencies(path: string): void {
    const deps = projectDependencyGraph.get(path)
    if (!deps)
      return

    deps.forEach((dep) => {
      if (!dependencies.has(dep)) {
        dependencies.add(dep)
        addDependencies(dep)
      }
    })
  }

  addDependencies(pagePath)
  return Array.from(dependencies)
}

function uniqueByKey<T>(arr: T[], key: keyof T): T[] {
  return Array.from(
    arr.reduce((map, item) => map.set(item[key], item), new Map<unknown, T>()).values(),
  )
}

/**
 * 生成每个页面的权限配置
 * @param projectAuths 每个页面的权限配置，包含了js/ts/vue页面
 * @param projectDependencyGraph 项目依赖关系图
 * @param projectRouteItems 每个vue页面的路由信息
 */
export function generateProjectCodeAuths(
  projectAuths: ProjectPageCodeAuthsMap,
  projectDependencyGraph: DependencyGraphMap,
  projectRouteItems: ProjectPageRouteMap,
): ProjectPageRouteAndCodeAuthsMap {
  const newProjectPageCodeAuths = new Map<
    string,
    {
      routeItem: RouteItem
      codeItems: CodeItem[]
    }
  >()
  projectRouteItems.forEach((routeItem, pagePath) => {
    if (!routeItem.name && !routeItem.path && !routeItem.label) {
      return
    }
    const defaultCodeItems = projectAuths.get(pagePath)
    if (!defaultCodeItems) {
      return
    }
    const dependencies = findDependencies(pagePath, projectDependencyGraph)
    dependencies.forEach((dependency) => {
      const dependencyCodeItems = projectAuths.get(dependency)
      if (dependencyCodeItems) {
        defaultCodeItems.push(...dependencyCodeItems)
      }
    })
    newProjectPageCodeAuths.set(pagePath, {
      routeItem,
      codeItems: uniqueByKey(defaultCodeItems, 'code'),
    })
  })
  return newProjectPageCodeAuths
}
