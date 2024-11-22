<template>
  <div>
    <ul>
      <li>
        <button v-if="currentPath!==''" @click="backPath">🔙 ..</button>

      </li>
      <li v-for="(file) in fileData" :key="file.fileName" class="flex justify-end"
      >
        <button
            @click="emitFileSelected(file)"
            :class="{ 'active-style': currentPlayInfo.path!==undefined && currentPlayInfo.path === file.path }"
        >

          <span class="file-name" :title="file.fileName">
            <span v-if="file.isDirectory">📁{{ file.fileName }}</span>
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
import {onMounted, ref} from 'vue';
import useCurrentPlayInfo from "../../../store/currentPlayInfo";
import {FileSimpleItem} from "../index";
import {FILE_PREFIX, getFile, GetFileList} from "@/api/fileList";

const currentPlayInfo = useCurrentPlayInfo();
const videoTypeList = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv']
// 是否存在任何一个文件夹
const hasDirectory = ref(false);

const fileData = ref<FileSimpleItem[]>([]);
const currentPath = ref<string>("");

function loadList() {
  GetFileList(currentPath.value).then((res) => {
    fileData.value = res;
    calcVideoDuration(fileData.value);
  })
}

onMounted(() => {
  loadList()
})
document.onmousedown = function (event) {
  if (event.button == 3) {
    // 阻止默认事件
    event.preventDefault();
    event.stopPropagation();
    //鼠标侧键3
    backPath()
  }
}


async function emitFileSelected(fileItem: FileSimpleItem) {
  try {
    // 如果是文件夹，则执行收起操作
    if (fileItem.isDirectory) {
      currentPath.value = currentPath.value + "/" + fileItem.fileName;
      loadList()
      return;
    }
    let url = currentPath.value + "/" + fileItem.fileName;

    let isVideo = false;
    // 判断是否是视频文件
    videoTypeList.forEach((type) => {
      if (fileItem.fileName.endsWith(type)) {
        console.log("video: ", fileItem);
        isVideo = true;
        return;
      }
    });
    if (!isVideo) {
      getFile(url);
    } else {
      console.log("video: ", FILE_PREFIX + url);
      currentPlayInfo.url = FILE_PREFIX + url;
    }
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

function calcVideoDuration(fileItemList: FileSimpleItem[]) {
  fileItemList.forEach((fileItem) => {
    if (fileItem.isDirectory) {
      hasDirectory.value = true;
      return;
    }
    if (fileItem.duration) {
      return;
    }
    const url = currentPath.value + "/" + fileItem.fileName;
    getVideoDuration(FILE_PREFIX + url).then((duration) => {
      fileItem.duration = duration;
    });
  });

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


// 返回上一级
function backPath() {
  // 去掉最后一级目录
  currentPath.value = currentPath.value.split("/").slice(0, -1).join("/");
  console.log(currentPath.value)
  loadList()
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