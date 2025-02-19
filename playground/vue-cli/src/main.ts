import Vue from 'vue'
import VueComposition from '@vue/composition-api'
import App from './App.vue'
// import test from './test'
// console.log('test', test)

Vue.config.productionTip = false
Vue.use(VueComposition)

new Vue({
  render: h => h(App),
}).$mount('#app')
