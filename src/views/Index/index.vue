<script setup lang="ts">
import { ref } from 'vue';
import { FileList } from "../../components/FileList";
import { Player } from "../../components/Player";

const selectedFile = ref('');

const handleFileSelected = (file: string) => {
  selectedFile.value = file;
};
</script>

<template>
  <div class="flex w-95vw p-10px">
    <div class="p-10px w-22vw">
      <FileList @file-selected="handleFileSelected"/>
    </div>
    <div class="p-10px w-full position-relative">
      <Player :file="selectedFile" class="position-sticky top-0" />
    </div>
  </div>
</template>

<style scoped>

</style>