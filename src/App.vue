<script setup lang="ts"></script>

<template>
  <div id="sk-app-main">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
@import './css/color.scss';
#sk-app-main {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-size: 16px;
  background-color: $main-color;
}
/* 美化滚动条 */
.sk-beautifulScrollbar::-webkit-scrollbar {
  width: 9px;
  margin: 0 3px;
}

.sk-beautifulScrollbar::-webkit-scrollbar-track {
  /* background: rgb( 201,205,212 ); */
}

.sk-beautifulScrollbar::-webkit-scrollbar-thumb {
  display: none;
  background-color: $scrollbar-thumb-color;
  border-radius: 10px;
}

.sk-beautifulScrollbar:hover::-webkit-scrollbar-thumb {
  display: block;
}

.sk-beautifulScrollbar::-webkit-scrollbar-thumb:hover {
  background-color: $scrollbar-thumb-color;
}
</style>
