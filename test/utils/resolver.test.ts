import '../__mocks__/fs'
import { describe, expect, it } from 'vitest'
import { customResolvePath } from '../../src/utils/resolver'
import { type AliasConfig, resolveOptions } from '../../src/types'

const aliasConfigs: AliasConfig[] = [
  {
    prefix: '@',
    // targetPath: resolve(cwd(), 'src'),
    targetPath: '/path/to/project/src',
  },
  {
    prefix: '@test',
    // targetPath: resolve(cwd(), 'src/test'),
    targetPath: '/path/to/project/src/test',
  },
  {
    prefix: '~',
    // targetPath: resolve(cwd(), 'src'),
    targetPath: '/path/to/project/src',
  },
]
const options = resolveOptions({
  aliasConfigs,
})
describe('customResolvePath', () => {
  const basePath = '/path/to/project/src/main.ts'

  it('should handle absolute paths', () => {
    expect(customResolvePath(basePath, '/path/to/project/src/request/index.ts', options))
      .toBe('/path/to/project/src/request/index.ts')
  })

  it('should handle different file extensions', () => {
    expect(customResolvePath(basePath, '@/components/Button.vue', options))
      .toBe('/path/to/project/src/components/Button.vue')

    expect(customResolvePath(basePath, '@/types/index.d.ts', options))
      .toBe('/path/to/project/src/types/index.d.ts')

    expect(customResolvePath(basePath, '@/styles/main.css', options))
      .toBe('/path/to/project/src/styles/main.css')
  })

  it('should handle edge cases', () => {
    // 空路径
    expect(customResolvePath(basePath, '', options))
      .toBe(null)

    // 无效别名
    expect(customResolvePath(basePath, '@invalid/path', options))
      .toBe(null)

    // 多层相对路径
    expect(customResolvePath(basePath, '../../some/deep/path', options))
      .toBe('/path/to/some/deep/path/index.ts')

    // 包含特殊字符的路径
    expect(customResolvePath(basePath, '@/path with spaces/index', options))
      .toBe('/path/to/project/src/path with spaces/index.ts')
  })

  it('should handle directory imports', () => {
    // 导入目录（应该解析到 index.ts）
    expect(customResolvePath(basePath, '@/utils', options))
      .toBe('/path/to/project/src/utils/index.ts')

    expect(customResolvePath(basePath, './utils', options))
      .toBe('/path/to/project/src/utils/index.ts')
  })
})
