import { vi } from 'vitest'

const mockFiles = new Map([
  // 原有的文件和目录
  ['/path/to/project/src/request', 'directory'],
  ['/path/to/project/src/request/index.ts', 'file'],
  ['/path/to/project/src/request/index.vue', 'file'],
  ['/path/to/project/request/index.ts', 'file'],
  ['/path/to/project/src/test/request/index.ts', 'file'],
  ['/path/to/project/src', 'directory'],

  // 新增的文件和目录，对应新测试用例
  // 组件测试相关
  ['/path/to/project/src/components', 'directory'],
  ['/path/to/project/src/components/Button.vue', 'file'],

  // 类型文件测试相关
  ['/path/to/project/src/types', 'directory'],
  ['/path/to/project/src/types/index.d.ts', 'file'],

  // 样式文件测试相关
  ['/path/to/project/src/styles', 'directory'],
  ['/path/to/project/src/styles/main.css', 'file'],

  // 多层路径测试相关
  ['/path/to/some/deep/path', 'directory'],
  ['/path/to/some/deep/path/index.ts', 'file'],

  // 特殊字符路径测试相关
  ['/path/to/project/src/path with spaces', 'directory'],
  ['/path/to/project/src/path with spaces/index.ts', 'file'],

  // utils 目录测试相关
  ['/path/to/project/src/utils', 'directory'],
  ['/path/to/project/src/utils/index.ts', 'file'],

  // 路径规范化测试相关
  ['/path/to/project/src/path/to/file', 'directory'],
  ['/path/to/project/src/path/to/file/index.ts', 'file'],
])

export const existsSync = (path: string): boolean => mockFiles.has(path)

export function statSync(path: string): {
  isFile: () => boolean
  isDirectory: () => boolean
} {
  const type = mockFiles.get(path)
  return {
    isFile: () => type === 'file',
    isDirectory: () => type === 'directory',
  }
}

// 在所有导入之前先mock
vi.mock('node:fs', () => ({ existsSync, statSync }))

// 模拟 path.resolve 方法
export const resolve = vi.fn((...paths: string[]) => {
  // 移除空字符串并过滤掉 undefined
  const validPaths = paths.filter(p => p && typeof p === 'string')

  // 将路径分割成段并处理每一段
  const segments = validPaths.join('/').split('/')
  const resultSegments: string[] = []

  for (const segment of segments) {
    if (segment === '' || segment === '.') {
      continue
    }
    if (segment === '..') {
      resultSegments.pop() // 回到上一级目录
    }
    else {
      resultSegments.push(segment)
    }
  }

  // 组合最终路径
  return `/${resultSegments.join('/')}`
})

// 在所有导入之前先mock
vi.mock('node:path', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:path')>()
  return {
    ...original,
    resolve,
  }
})
