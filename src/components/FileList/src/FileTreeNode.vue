<template>
  <li>
    <div>
      <button @click="toggleExpand" :class="file.isDirectory ? '' : 'ml-18px'">
        <span class="file-name">
          <span v-if="file.isDirectory">{{ file.isExpanded ? '📂' : '📁' }}</span>
          <span v-else>📄</span>
          {{ file.fileName }}
        </span>
        <span v-if="file.duration" class="file-duration">
          {{ formatDuration(file.duration) }}
        </span>
      </button>
    </div>
    <ul v-if="file.isDirectory && file.isExpanded">
      <FileTreeNode
          v-for="(child, idx) in file.children"
          :key="child.fileName + idx"
          :file="child"
          @file-selected="$emit('file-selected', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import {PropType} from 'vue';

// 定义 FileTreeNode 组件的 props 和 emit
const props = defineProps({
  file: {
    type: Object as PropType<{
      fileHandle: FileSystemFileHandle | FileSystemDirectoryHandle;
      fileName: string;
      duration?: number;
      isDirectory: boolean;
      children?: any[];
      isExpanded?: boolean;
    }>,
    required: true,
  },
});

const emit = defineEmits(['file-selected']);

// 点击展开或折叠文件夹
const toggleExpand = () => {
  if (props.file.isDirectory) {
    props.file.isExpanded = !props.file.isExpanded;
  } else {
    emit('file-selected', props.file);
  }
};

// 格式化视频文件的时长显示
function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
</script>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 20px;
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
