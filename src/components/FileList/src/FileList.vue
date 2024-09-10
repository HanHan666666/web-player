<template>
  <div>
    <button @click="listFilesInDirectory">选择文件</button>
    <ul>
      <li v-for="(file, index) in files" :key="index">
        <button @click="emitFileSelected(file)">
          {{ directoryName + '/' + file.fileName }}
          <span v-if="file.duration"> {{ formatDuration(file.duration) }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MingcuteTimeLine from '~icons/mingcute/time-line';
const emit = defineEmits(['file-selected']);
const files = ref<{ fileHandle: FileSystemFileHandle, fileName: string, duration?: number }[]>([]);
const directoryName = ref('');

async function listFilesInDirectory() {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    directoryName.value = directoryHandle.name;

    files.value = [];

    // 遍历文件夹中的文件
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'file') {
        const fileHandle = entry; // 这是FileSystemFileHandle对象
        const file = await fileHandle.getFile(); // 获取文件对象
        const fileUrl = URL.createObjectURL(file); // 生成文件URL
        const duration = await getVideoDuration(fileUrl); // 获取视频时长

        files.value.push({ fileHandle, fileName: file.name, duration });
      }
    }
  } catch (error) {
    console.error('Error accessing the directory:', error);
  }
}

async function emitFileSelected(fileItem: { fileHandle: FileSystemFileHandle, fileName: string, duration?: number }) {
  try {
    const fileData = await fileItem.fileHandle.getFile();
    const fileUrl = URL.createObjectURL(fileData);
    emit('file-selected', fileUrl);
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

async function getVideoDuration(fileUrl: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = fileUrl;
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = () => {
      resolve(undefined);
    };
  });
}

function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
</script>

<style scoped>
ul {
  width: 100%;
  list-style-type: none;
  padding: 0;
}

li {
  button{
    display: flex;
    width: 100%;
    justify-content: space-between;

  }
  width: 100%;
  margin-bottom: 10px;
}
</style>
