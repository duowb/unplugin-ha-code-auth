const { defineConfig } = require('@vue/cli-service')
const unpluginCodeAuth = require('../../dist/webpack.cjs')

console.log('unpluginCodeAuth', unpluginCodeAuth)

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      unpluginCodeAuth(),
    ],
  },
})
