<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
    <Home />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import HelloWorld from "./components/HelloWorld.vue";
import Home from './home.vue'
export default defineComponent({
  components: {
    HelloWorld,
    Home,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
