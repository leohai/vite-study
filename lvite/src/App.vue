<template>
  <div>
    {{title}}
  </div>
</template>

<script>
  import { reactive, toRefs } from 'vue'
  export default{
    setup(){
      const state = reactive({
        title:"vite 实验版成功"
      })
      return {
        ...toRefs(state)
      }
    }
  }
</script>
<style lang="scss" scoped>

</style>