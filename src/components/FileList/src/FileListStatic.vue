<template>
  <div>
    <div class="mb-10px" v-if="currentPlayInfo.playList.length === 0">👇请点击下方按钮选择视频目录或者单个视频</div>
    <button @click="selectDirectory">选择文件夹</button>
    <button class="ml-18px" @click="selectFile">选择文件</button>
    <span v-if="directoryHandleRef!=null" class="ml-15px cursor-pointer" title="重新读取文件夹"
          @click="refreshDirectory">↻</span>
    <div class="mt-10px" v-if="!currentPlayInfo.path &&currentPlayInfo.playList.length > 0 ">👇请在下方选择要播放的视频
    </div>
    <ul class="overflow-y-auto h-87vh" style="padding-right: 5px">
      <li v-for="(file) in currentPlayInfo.playList" :key="file.path" class="flex justify-end"
          v-show="file.isDirectory || file.isVisible.value">
        <button
            @click="emitFileSelected(file)"
            :class="{
              'max-width-95': !file.isDirectory && currentPlayInfo.playList.length!==1 && hasDirectory && file.path !== '.',
              'active-style': currentPlayInfo.path!==undefined && currentPlayInfo.path === file.path
            }"
        >

          <span class="file-name" :title="file.fileName">
            <span v-if="file.isDirectory">{{ file.isVisible.value ? '📂' : '📁' }}{{ file.fileName }}</span>
            <span v-else>📄{{ file.fileName }}</span>
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
import useCurrentPlayInfo from "../../../store/currentPlayInfo";
import {FileItem} from "../index";

// 获取当前播放信息
const currentPlayInfo = useCurrentPlayInfo();

// 是否存在任何一个文件夹
const hasDirectory = ref(false);

// 文件列表
let directoryHandleRef = ref()

// 刷新文件夹
function refreshDirectory() {
  try {
    listFilesInDirectory(directoryHandleRef.value!);
  } catch (error) {
    console.log(error)
    alert("请重新选择文件夹")
  }
}

// 选择文件夹
async function selectDirectory() {
  try {
    const directoryHandle = await window.showDirectoryPicker();
    directoryHandleRef.value = directoryHandle
    await listFilesInDirectory(directoryHandle);
  } catch (error) {
    console.error('Error selecting directory:', error);
  }
}

async function listFilesInDirectory(directoryHandle: FileSystemDirectoryHandle) {
  try {
    currentPlayInfo.playList = [];
    let entries: { entry: FileSystemHandle; path: string }[] = [];
    console.log('directoryHandle', directoryHandle);
    console.log('directoryHandle.values()', directoryHandle.values());
    // 顶级目录文件夹靠前，文件靠后
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'directory') {
        entries.push({entry, path: '.'});
      }
    }
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'file') {
        entries.push({entry, path: '.'});
      }
    }
    console.log('entries', entries);

    // 对当前文件夹中的文件和子文件夹按完整路径进行排序
    // entries.sort((a, b) => naturalSort(a.path, b.path));

    await traverseDirectory(entries, '');
    console.log('files', currentPlayInfo.playList);
  } catch (error) {
    console.error('Error accessing the directory:', error);
  }
}

// // 自定义排序函数，按自然数顺序排列文件名
// function naturalSort(a: string, b: string) {
//   return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
// }

async function traverseDirectory(
    entries: { entry: FileSystemHandle, path: string }[],
    // directoryHandle: FileSystemDirectoryHandle,
    parentPath: string,
    isVisible: { value: boolean } = {value: true}
) {
  for (const {entry, path} of entries) {
    if (entry.kind === 'file') {
      const fileHandle = entry;
      // console.log('fileHandle', fileHandle, 'path', path);
      const file = await fileHandle.getFile();
      const fileUrl = URL.createObjectURL(file);
      const duration = await getVideoDuration(fileUrl);

      // 只保留文件名，不包含路径
      currentPlayInfo.playList.push({
        fileHandle,
        fileName: file.name,
        duration,
        isDirectory: false,
        path,
        isVisible: isVisible
      });
    } else if (entry.kind === 'directory') {
      const isVisible = {value: false};
      const subDirectoryPath = parentPath ? `${parentPath}/${entry.name}` : `${entry.name}`;
      const subEntries: { entry: FileSystemHandle; path: string }[] = [];
      for await (const subEntry of entry.values()) {
        subEntries.push({entry: subEntry, path: `${subDirectoryPath}/${subEntry.name}`});
      }

      // 对子文件夹中的文件和子文件夹按完整路径进行排序
      // subEntries.sort((a, b) => naturalSort(a.path, b.path));

      currentPlayInfo.playList.push({fileHandle: entry, fileName: subDirectoryPath, isDirectory: true, isVisible});
      hasDirectory.value = true;
      await traverseDirectory(subEntries, subDirectoryPath, isVisible);
    }
  }
}


async function emitFileSelected(fileItem: FileItem) {
  // console.log("emitFileSelected fileInfoStatic",fileItem)
  try {
    // 如果是文件夹，则执行收起操作
    if (fileItem.isDirectory) {
      fileItem.isVisible.value = !fileItem.isVisible.value;
      return;
    }
    currentPlayInfo.setCurrentVideo(fileItem)
    const fileData = await fileItem.fileHandle.getFile();
    currentPlayInfo.url = URL.createObjectURL(fileData);
    currentPlayInfo.path = fileItem.path;
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

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600); // 计算小时
  const minutes = Math.floor((seconds % 3600) / 60); // 计算分钟
  const secs = Math.round(seconds % 60); // 计算秒数

  // 使用 padStart 确保两位数格式
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(secs).padStart(2, '0');

  // return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  if (hours > 0) {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}

async function selectFile() {
  try {
    // @ts-ignore 实验特性
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const fileUrl = URL.createObjectURL(file);
    const duration = await getVideoDuration(fileUrl);

    const singleFile = {
      fileHandle,
      fileName: file.name,
      duration,
      isDirectory: false,
      path: file.name,
      isVisible: {value: true}
    };
    currentPlayInfo.playList.push(singleFile);
    await emitFileSelected(singleFile);
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

  .active-style {
    background-color: rgba(100, 108, 255, 0.28);
    color: black;
  }

  .max-width-95 {
    max-width: 95%;
  }
}
</style>