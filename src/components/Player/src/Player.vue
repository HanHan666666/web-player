<template>
  <div ref="vs"></div>
</template>
<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from "vue";
import Player from 'xgplayer';
import 'xgplayer/dist/xgplayer.css';

const props = defineProps<{
  file: string;
}>();

const xgplayer = useTemplateRef('vs');
let player: Player | null = null;

onMounted(() => {
  player = new Player({
    el: xgplayer.value,
    url: props.file,
    fluid: true,
    width: 600,
    height: 350,
  });
});

watch(() => props.file, (newFile) => {
  if (player) {
    player.reset();
    console.log('newFile', newFile);
    player.setConfig({
      url: newFile
    });
    player.play();
  }
});
</script>

<style scoped>

</style>