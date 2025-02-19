<template>
  <div>
    <h1>Home</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export const route = {
  name: 'Home',
  path: '/home',
  label: '首页',
}
export default defineComponent({
  name: 'Home',
  setup() {
    const codeAuths = [
      {
        code: 'test',
        label: '测试',
      },
      {
        code: 'test2',
        label: '测试2',
      },
      {
        code: 'test3',
        label: '测试3',
      },
    ]
    return {
      codeAuths,
    }
  },
})
</script>

