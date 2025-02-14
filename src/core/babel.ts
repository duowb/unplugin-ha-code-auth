import { parse } from '@babel/parser'
import type {
  CallExpression,
  Expression,
  MemberExpression,
  Node,
  ObjectExpression,
  PatternLike,
  TSAsExpression,
} from '@babel/types'
import {
  isCallExpression,
  isIdentifier,
  isImportDeclaration,
  isMemberExpression,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
  isTSAsExpression,
  traverseFast,
} from '@babel/types'
import type {
  CodeItem,
  OptionsResolved,
  PartialCodeItem,
} from '../types'
import { customResolvePath } from '../utils/resolver'
import { createI18n } from '../utils/simpleI18n'

const i18n = createI18n()
export function parseCode(sourceCode: string): ReturnType<typeof parse> {
  const babelAST = parse(sourceCode, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })
  return babelAST
}

function getCallExpressionLabel(
  value: CallExpression,
  sourceCode: string,
): string {
  // i18n.t('check')
  const result = sourceCode.slice(value.start || 0, value.end || 0)
  const firstArg = value.arguments[0]
  if (result.includes('i18n') && isStringLiteral(firstArg)) {
    return i18n.resolve(firstArg.value)
  }
  return result
}

function createI18nValueRegex(variableName: string): RegExp {
  // 转义特殊字符，防止变量名中包含正则特殊字符
  const escapedVarName = variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // 构造正则表达式
  const pattern = `${escapedVarName}\\s*=\\s*computed\\(\\(\\)\\s*=>\\s*\\(\\{([^}]+)\\}\\)\\)`
  return new RegExp(pattern)
}

function extractI18nKey(text: string): string {
  return text.split('\'')[1] || text.split('"')[1]
}
/**
 * 获取成员表达式的标签
 * @param value 成员表达式
 * @param sourceCode 源代码
 * @description 代码中有的地方这样使用i18n
 * ```ts
 * const i18nVal = computed(() => ({
 *   check: $i18n.t('check'),
 *   add: $i18n.t('add') as string,
 * }))
 *
 * const add = i18nVal.value.add;
 * const check = i18nVal.value.check;
 * ```
 *
 * @returns 标签
 */
function getMemberExpressionLabel(
  value: MemberExpression,
  sourceCode: string,
): string {
  const result = sourceCode.slice(value.start || 0, value.end || 0)

  if (!result.includes('i18n'))
    return result

  const [first, ...rest] = result.split('.')
  const end = rest.at(-1) || ''
  const i18nValDefRegex = createI18nValueRegex(first)
  const i18nValDef = sourceCode.match(i18nValDefRegex)?.[1]

  if (!i18nValDef)
    return result

  // 解析所有的键值对
  const i18nMap: Record<string, string> = {}
  i18nValDef.split(',').forEach((pair) => {
    const [key, value] = pair.trim().split(':').map(s => s.trim())
    if (key && value) {
      i18nMap[key] = value
    }
  })
  const endValue = extractI18nKey(i18nMap[end])
  return i18n.resolve(endValue)
}

function getTSAsExpressionLabel(
  value: TSAsExpression,
  sourceCode: string,
): string {
  // i18n.t('check') as string
  if (isCallExpression(value.expression)) {
    return getCallExpressionLabel(value.expression, sourceCode)
  }
  return sourceCode.slice(value.start || 0, value.end || 0)
}

function getLabel(
  value: Expression | PatternLike,
  sourceCode: string,
): string | undefined {
  if (isStringLiteral(value)) {
    return value.value
  }
  if (isCallExpression(value)) {
    return getCallExpressionLabel(value, sourceCode)
  }
  if (isMemberExpression(value)) {
    return getMemberExpressionLabel(value, sourceCode)
  }
  if (isTSAsExpression(value)) {
    return getTSAsExpressionLabel(value, sourceCode)
  }
  return undefined
}

function ObjectExpressionNode(
  node: ObjectExpression,
  sourceCode: string,
): PartialCodeItem {
  const isExistLabelAndCode: PartialCodeItem = {}
  node.properties.forEach((propertieItem) => {
    if (!isObjectProperty(propertieItem))
      return
    const { key, value } = propertieItem
    if (!isIdentifier(key))
      return
    if (key.name === 'code' && isStringLiteral(value)) {
      isExistLabelAndCode[key.name] = value.value
    }
    else if (key.name === 'label') {
      const valueData = getLabel(value, sourceCode)
      if (!valueData)
        return
      isExistLabelAndCode[key.name] = valueData
    }
  })
  return isExistLabelAndCode
}

function getDependencies(
  node: Node,
  path: string,
  options: OptionsResolved,
): string | null {
  if (isImportDeclaration(node)) {
    const { value } = node.source
    return customResolvePath(path, value, options)
  }
  if (isCallExpression(node)) {
    if (
      node.callee.type === 'V8IntrinsicIdentifier'
      && node.callee.name === 'require'
    ) {
      if (node.arguments[0]?.type === 'StringLiteral') {
        const value = node.arguments[0].value
        return customResolvePath(path, value, options)
      }
    }
  }
  return null
}

export function traverseCode(
  codeAST: ReturnType<typeof parseCode>,
  sourceCode: string,
  id: string,
  options: OptionsResolved,
): {
    currentPageCodeAuths: CodeItem[]
    currentDependencies: string[]
  } {
  const currentPageCodeAuths: CodeItem[] = []
  const currentDependencies: string[] = []
  traverseFast(codeAST, (node) => {
    const dependencies = getDependencies(node, id, options)
    if (dependencies) {
      currentDependencies.push(dependencies)
    }
    if (!isObjectExpression(node))
      return
    const { code, label } = ObjectExpressionNode(node, sourceCode)
    if (!code || !label)
      return
    currentPageCodeAuths.push({ code, label })
  })

  return { currentDependencies, currentPageCodeAuths }
}
