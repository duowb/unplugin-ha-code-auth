import { compileScript, parse } from '@vue/compiler-sfc'
import type { ObjectExpression, Statement } from '@babel/types'
import { isExportNamedDeclaration } from '@babel/types'
import type { RouteItem } from '../types'

function getRouteObjectExpression(
  item: Statement,
): ObjectExpression | undefined {
  if (!isExportNamedDeclaration(item))
    return
  const { exportKind, declaration } = item
  if (exportKind !== 'value')
    return
  if (declaration?.type !== 'VariableDeclaration')
    return
  const { declarations } = declaration
  const { id, init } = declarations[0]

  if (id.type !== 'Identifier')
    return
  if (id.name !== 'route')
    return
  if (!init || init.type !== 'ObjectExpression')
    return
  return init
}

function parseScriptRoute(scriptAst: Statement[]): RouteItem | null {
  const pageRouteItem: RouteItem = {
    name: '',
    path: '',
    label: '',
  }
  scriptAst.forEach((item) => {
    const route = getRouteObjectExpression(item)
    if (!route)
      return
    const { properties } = route
    properties.forEach((item) => {
      if (item.type !== 'ObjectProperty')
        return
      const { key, value } = item
      if (key.type !== 'Identifier')
        return
      if (value.type !== 'StringLiteral')
        return
      if (!['name', 'path', 'label'].includes(key.name))
        return
      pageRouteItem[key.name as keyof RouteItem] = value.value
    })
  })
  if (!pageRouteItem.name)
    return null
  return pageRouteItem
}

export function parseVue(
  code: string,
): { content: string, routeItem: RouteItem | null } {
  const { descriptor } = parse(code)
  const { content, scriptAst = [] } = compileScript(descriptor, {
    id: 'script',
  })
  const routeItem = parseScriptRoute(scriptAst)

  return { content, routeItem }
}
