<template>
  <div class="flex w-95vw p-10px">
    <div class="pt-10px w-22vw mr-10px">
      <FileList/>
    </div>
    <div class="p-10px w-full">
      <Player class="top-10"/>
    </div>
  </div>
</template>
<script setup lang="ts">

import {defineAsyncComponent} from "vue";
import {Player} from "../../components/Player";

const FileList = (() => {
  if (import.meta.env.VITE_RUN_MODE === "static") {
    return defineAsyncComponent(() => import('../../components/FileList/src/FileListStatic.vue'))
  } else {
    return defineAsyncComponent(() => import('../../components/FileList/src/FileListServer.vue'))
  }
})()


</script>

<style scoped>

</style>