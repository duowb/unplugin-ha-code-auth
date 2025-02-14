# unplugin-ha-code-auth

[![NPM version](https://img.shields.io/npm/v/unplugin-ha-code-auth?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-ha-code-auth)

感谢 [unplugin](https://github.com/unjs/unplugin).

## 使用场景
遍历当前vue页面中有哪些权限配置.

## 思路
遍历每个文件中的对象是否包含了`code`和`label`两个属性,那么就会认为是一个权限配置，将收集到当前文件中，然后再找到当前文件被哪些文件所依赖，只到找到最顶层没有被依赖的页面，那么就将这些权限配置归属到这个没有被依赖的页面中。

## 安装

```bash
npm i unplugin-ha-code-auth
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Starter from 'unplugin-ha-code-auth/vite'

export default defineConfig({
  plugins: [
    Starter({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import Starter from 'unplugin-ha-code-auth/rollup'

export default {
  plugins: [
    Starter({ /* options */ }),
  ],
}
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-ha-code-auth/webpack')({ /* options */ })
  ]
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    ['unplugin-ha-code-auth/nuxt', { /* options */ }],
  ],
})
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-ha-code-auth/webpack')({ /* options */ }),
    ],
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import Starter from 'unplugin-ha-code-auth/esbuild'

build({
  plugins: [Starter()],
})
```

<br></details>

# 配置选项

## Options 配置项

插件的主要配置选项，包含以下参数：

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| include | FilterPattern | `[/\.[cm]?[jt]sx?$\|\.vue$/]` | 需要处理的文件匹配模式 |
| exclude | FilterPattern | `[/node_modules/]` | 需要排除的文件匹配模式 |
| enforce | 'pre' \| 'post' \| undefined | 'pre' | 插件执行时机 |
| codeFilePath | string | `resolve(cwd(), 'projectCodePermissions.json')` | 权限代码配置文件路径 |
| aliasConfigs | AliasConfig[] | 见下方说明 | 路径别名配置列表 |
| ignoreFiles | string[] | `['node_modules', 'assets']` | 忽略的文件列表 |

## AliasConfig 别名配置

用于配置路径别名的选项：

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| prefix | string | `'@'` 和 `'~'` | 别名前缀符号 |
| targetPath | string | `resolve(cwd(), 'src')` | 别名对应的目标路径 |
