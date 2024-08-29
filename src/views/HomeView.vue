<template>
  <div class="Home">
    <sk-header class="header"/>
    <sk-container class="container" />
    <sk-footer class="footer" />
  </div>
</template>
<script setup lang="ts">
import skHeader from './SK-Header.vue'
import skContainer from './SK-Container.vue'
import skFooter from './SK-Footer.vue'

</script>

<style lang="scss" scoped>

.Home{
  min-height: 100%;
  .header{
    height: 50px;
    align-items: center;
    margin: 0 20px;
  }
  .container{
    height: 60%;
    background-color: aqua;
  }
}
</style>
