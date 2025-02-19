const { defineConfig } = require('@vue/cli-service')
const unpluginCodeAuth = require('unplugin-ha-code-auth/webpack')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      unpluginCodeAuth(),
    ],
  },
})
