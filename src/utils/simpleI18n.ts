import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import type { I18nValue } from '../types'

export class SimpleI18n {
  private messages: Record<string, I18nValue>

  constructor(messages: Record<string, I18nValue>) {
    this.messages = messages
  }

  /**
   * 解析带引用的翻译键
   * @param key 翻译键
   * @returns 解析后的值
   */
  resolve(key: string): string {
    if (!key.includes('@:')) {
      return this.getValue(key)
    }

    let result = key
    let lastResult = ''

    // 持续解析直到没有更多变化
    while (result !== lastResult) {
      lastResult = result
      // 修改正则表达式以匹配更多场景，包括英文单词
      result = result.replace(/@:([\w.\-]+)/g, (_, path) => {
        return this.getValue(path.trim())
      })
    }

    return result
  }

  private getValue(path: string): string {
    const value = path.split('.')
      .reduce((obj: any, key) => obj?.[key], this.messages) || path

    // 如果解析出的值中包含 @:，则需要继续解析
    return typeof value === 'string' && value.includes('@:')
      ? this.resolve(value) // 递归解析
      : value
  }
}
function getI18nData(): Record<string, I18nValue> {
  try {
    const filePath = resolve(cwd(), 'src', 'i18n', 'locale', 'zh-CN.json')
    const i18nData = readFileSync(filePath, 'utf-8')
    return JSON.parse(i18nData)
  }
  catch (error: any) {
    console.warn('无法读取 i18n 文件，将使用空对象作为默认值', error)
    return {}
  }
}

// 修改导出方式，允许传入自定义 messages
export function createI18n(customMessages?: Record<string, I18nValue>): SimpleI18n {
  const messages = customMessages || getI18nData()
  return new SimpleI18n(messages)
}
