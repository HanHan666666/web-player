<template>
  <div>
    <div ref="vs"></div>
    <span class="text-xl pt-20px">{{ currentPlayInfo.currentVideo?.fileName }}</span>
  </div>
</template>
<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from "vue";
import Player, { Events } from 'xgplayer';
import FastPlugin from '@/components/Player/components/fastPlugin'
import BackPlugin from '@/components/Player/components/backPlugin'
import 'xgplayer/dist/index.min.css';
import useCurrentPlayInfo from "@/store/currentPlayInfo";

const xgplayer = useTemplateRef('vs');
const currentPlayInfo = useCurrentPlayInfo();
let player: Player | null = null;

onMounted(() => {
  if (xgplayer.value) {
    player = new Player({
      el: xgplayer.value,
      url: currentPlayInfo.url,
      playbackRate: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      playsinline: true,
      fluid: true,
      width: 600,
      height: 350,
      plugins: [FastPlugin, BackPlugin]
    });
    player.on(Events.ENDED, () => {
      currentPlayInfo.next()
    })
  } else {
    console.error('xgplayer is not ready', xgplayer.value);
  }
});
watch(() => currentPlayInfo.url, (newFile) => {
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

<style scoped></style>
