<template>
  <div id="app">
    <Map3D />
  </div>
</template>

<script setup lang="ts">
import Map3D from '@/components/Map3D.vue'
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>