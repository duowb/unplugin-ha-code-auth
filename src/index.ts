import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import type { Options } from './types'
import { resolveOptions } from './types'
import { CodeScanner } from './core'

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
  rawOptions = {},
) => {
  const scanner = new CodeScanner(resolveOptions(rawOptions))
  return {
    name: 'unplugin-ha-code-auth',
    async buildStart() {
      scanner.scan().writeToFile()
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
