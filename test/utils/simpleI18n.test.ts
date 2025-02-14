import { describe, expect, it } from 'vitest'
import { createI18n } from '../../src/utils/simpleI18n'

const messages = {
  cancel: '取消',
  select_all: '全选',
  cancel_select_all: '@:cancel@:select_all',
  data: '数据',
  update: '修改',
  common: {
    enabled: '启用',
  },
  more: '@:cancel@:data,@:common.enabled@:update的@:data',
}
describe('simpleI18n', () => {
  it('should resolve i18n keys', () => {
    const i18n = createI18n(messages)
    expect(i18n.resolve('data')).toMatchInlineSnapshot(`"数据"`)
    expect(i18n.resolve('cancel_select_all')).toMatchInlineSnapshot(`"取消全选"`)
    expect(i18n.resolve('common.enabled')).toMatchInlineSnapshot(`"启用"`)
    expect(i18n.resolve('more')).toMatchInlineSnapshot(`"取消数据,启用修改的数据"`)
  })
})
