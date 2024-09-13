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
import { ref } from 'vue';
import FileTreeNode from './FileTreeNode.vue'; // 引入FileTreeNode组件

// 定义文件结构类型
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

    // 将顶级文件夹添加到 files 中并设置为默认展开
    files.value = [{
      fileHandle: directoryHandle,
      fileName: directoryHandle.name,
      isDirectory: true,
      isExpanded: true, // 默认展开顶级目录
      children: await traverseDirectory(directoryHandle),
    }];
  } catch (error) {
    console.error('Error selecting directory:', error);
  }
}

// 递归遍历文件夹
async function traverseDirectory(directoryHandle: FileSystemDirectoryHandle): Promise<FileItem[]> {
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
        isExpanded: false, // 子文件夹默认折叠
      });
    }
  }

  // 使用自然排序，先文件夹后文件
  items.sort(naturalSort);

  return items;
}

// 自然排序，文件夹在前，文件在后
function naturalSort(a: FileItem, b: FileItem): number {
  // 首先根据是否为目录进行排序，目录在前，文件在后
  if (a.isDirectory && !b.isDirectory) {
    return -1; // a 是文件夹，b 是文件，a 应该排在 b 前
  } else if (!a.isDirectory && b.isDirectory) {
    return 1;  // a 是文件，b 是文件夹，a 应该排在 b 后
  } else {
    // 如果两者都是文件或两者都是文件夹，按名称自然排序
    return a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' });
  }
}

// 选择文件并获取视频时长
async function selectFile() {
  try {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const fileUrl = URL.createObjectURL(file);
    const duration = await getVideoDuration(fileUrl);

    files.value.push({
      fileHandle,
      fileName: file.name,
      duration,
      isDirectory: false,
    });
  } catch (error) {
    console.error('Error selecting file:', error);
  }
}

// 格式化视频时长
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

function emitFileSelected(fileItem: FileItem) {
  if (!fileItem.isDirectory) {
    // Emit the file-selected event to handle file opening
    console.log(`Selected file: ${fileItem.fileName}`);
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
