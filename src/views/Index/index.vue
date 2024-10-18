<script setup lang="ts">
import {FileList} from "../../components/FileList";
import {Player} from "../../components/Player";
</script>

<template>
  <div class="flex w-95vw p-10px overflow-visible">
    <div class="p-10px w-22vw mr-10px">
      <FileList/>
    </div>
    <div class="p-10px w-full position-relative">
      <Player class="position-sticky top-10"/>
    </div>
  </div>
</template>

<style scoped>

</style>