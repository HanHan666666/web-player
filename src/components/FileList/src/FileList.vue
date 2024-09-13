<template>
  <div>
    <button @click="selectDirectory">选择文件夹</button>
    <button class="ml-18px" @click="selectFile">选择文件</button>
    <ul>
      <FileTreeNode
          v-for="(file, index) in files"
          :key="file.fileName + index"
          :file="file"
          @file-selected="emitFileSelected"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import FileTreeNode from "./FileTreeNode.vue";

const emit = defineEmits(['file-selected']);

type FileItem = {
  fileHandle: FileSystemFileHandle | FileSystemDirectoryHandle;
  fileName: string;
  duration?: number;
  isDirectory: boolean;
  children?: FileItem[];
  isExpanded?: boolean;
};

const files = ref<FileItem[]>([]);

async function selectDirectory() {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    files.value = await traverseDirectory(directoryHandle);
  } catch (error) {
    console.error('Error selecting directory:', error);
  }
}

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
}

async function traverseDirectory(
    directoryHandle: FileSystemDirectoryHandle
): Promise<FileItem[]> {
  const items: FileItem[] = [];

  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file') {
      const fileHandle = entry as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      const fileUrl = URL.createObjectURL(file);
      const duration = await getVideoDuration(fileUrl);

      items.push({
        fileHandle,
        fileName: file.name,
        duration,
        isDirectory: false,
      });
    } else if (entry.kind === 'directory') {
      const subDirectoryHandle = entry as FileSystemDirectoryHandle;
      const children = await traverseDirectory(subDirectoryHandle);

      items.push({
        fileHandle: subDirectoryHandle,
        fileName: subDirectoryHandle.name,
        isDirectory: true,
        children,
        isExpanded: false, // 目录默认是折叠的
      });
    }
  }

  // 对文件和文件夹进行自然排序
  items.sort((a, b) => naturalSort(a.fileName, b.fileName));

  return items;
}

async function emitFileSelected(fileItem: FileItem) {
  if (fileItem.isDirectory) {
    // 对目录点击不进行处理
    return;
  }
  try {
    const fileData = await (fileItem.fileHandle as FileSystemFileHandle).getFile();
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


</script>

<style scoped>
ul {
  width: 100%;
  list-style-type: none;
  padding-left: 20px;
  padding-right: 20px;
}

li {
  margin-bottom: 5px;
}

button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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
</style>
