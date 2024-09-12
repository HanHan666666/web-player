<template>
  <div>
    <button @click="selectDirectory">选择文件夹</button>
    <button class="ml-18px" @click="selectFile">选择文件</button>
    <ul>
      <li v-for="(file, index) in files" :key="file.fileName">
        <button @click="emitFileSelected(file)" :class="file.isDirectory ? '' : 'ml-18px'">

          <span class="file-name">
            <span v-if="file.isDirectory">📁</span>
            <span v-else >📄</span>
            {{ file.fileName }}
          </span>
          <span v-if="file.duration" class="file-duration">
            {{ formatDuration(file.duration) }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {ref} from 'vue';

const emit = defineEmits(['file-selected']);
const files = ref<{ fileHandle: FileSystemFileHandle, fileName: string, duration?: number, isDirectory: boolean }[]>([]);

async function selectDirectory() {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    await listFilesInDirectory(directoryHandle);
  } catch (error) {
    console.error('Error selecting directory:', error);
  }
}

async function listFilesInDirectory(directoryHandle: FileSystemDirectoryHandle) {
  try {
    files.value = [];
    const entries = [];
    for await (const entry of directoryHandle.values()) {
      entries.push({ entry, path: entry.name });
    }

    // 对当前文件夹中的文件和子文件夹按完整路径进行排序
    entries.sort((a, b) => naturalSort(a.path, b.path));

    await traverseDirectory(entries, directoryHandle, '');
  } catch (error) {
    console.error('Error accessing the directory:', error);
  }
}
// 自定义排序函数，按自然数顺序排列文件名
function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

async function traverseDirectory(entries: { entry: FileSystemHandle, path: string }[], directoryHandle: FileSystemDirectoryHandle, parentPath: string) {
  for (const { entry, path } of entries) {
    if (entry.kind === 'file') {
      const fileHandle = entry;
      const file = await fileHandle.getFile();
      const fileUrl = URL.createObjectURL(file);
      const duration = await getVideoDuration(fileUrl);

      // 只保留文件名，不包含路径
      files.value.push({ fileHandle, fileName: file.name, duration, isDirectory: false });
    } else if (entry.kind === 'directory') {
      const subDirectoryPath = parentPath ? `${parentPath}/${entry.name}` : `${entry.name}`;
      const subEntries = [];
      for await (const subEntry of entry.values()) {
        subEntries.push({ entry: subEntry, path: `${subDirectoryPath}/${subEntry.name}` });
      }

      // 对子文件夹中的文件和子文件夹按完整路径进行排序
      subEntries.sort((a, b) => naturalSort(a.path, b.path));

      files.value.push({ fileHandle: entry, fileName: subDirectoryPath, isDirectory: true });
      await traverseDirectory(subEntries, entry, subDirectoryPath);
    }
  }
}

async function emitFileSelected(fileItem: { fileHandle: FileSystemFileHandle, fileName: string, duration?: number, isDirectory: boolean }) {
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

async function selectFile() {
  try {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const fileUrl = URL.createObjectURL(file);
    const duration = await getVideoDuration(fileUrl);

    files.value.push({ fileHandle, fileName: file.name, duration, isDirectory: false });
  } catch (error) {
    console.error('Error selecting file:', error);
  }
}
</script>


<style scoped>
ul {
  width: 100%;
  list-style-type: none;
  padding: 0;
}

li {
  width: 100%;
  margin-bottom: 10px;

  button {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
  }

  .file-name {
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-duration {
    text-align: right;
    flex-shrink: 0;
    padding-left: 10px;
  }
}
</style>