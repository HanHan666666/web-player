import {defineStore} from "pinia";
import {ref} from "vue";
import {FileItem} from "@/components/FileList";
import {VideoSupportList} from "@/components/Player";

const useCurrentPlayInfo = defineStore('currentPlayInfo', () => {
    const url = ref<string>();
    const path = ref<string | undefined>();
    const playList = ref<FileItem[]>([]);
    const currentVideo = ref<FileItem>()

    // 下一个视频
    async function next() {
        const index = playList.value.findIndex(item => item.path === path.value);
        if (index === -1) {
            return;
        }
        let nextIndex = (index + 1) % playList.value.length;
        while (true) {
            let tempVideoInfo = playList.value[nextIndex]
            let fileName = tempVideoInfo.fileName
            // 获取文件后缀
            const fileSuffix = fileName.split('.').pop() || "";
            // 如果下一个文件不是视频，就再寻找下一个
            if (!VideoSupportList.includes(fileSuffix)) {
                nextIndex = (nextIndex + 1) % playList.value.length;
            } else {
                currentVideo.value = tempVideoInfo
                await setCurrentVideo(tempVideoInfo)
                break;
            }
        }
    }

    async function setCurrentVideo(fileItem: FileItem) {
        currentVideo.value = fileItem
        console.log('setCurrentVideo fileItem', fileItem);
        if (fileItem.fileName) {
            document.title = fileItem.fileName;
        }
        // 找到之后就结束循环
        path.value = fileItem.path;
        const fileData = await fileItem?.fileHandle.getFile();
        url.value = URL.createObjectURL(fileData);
    }

    return {
        url,
        path,
        playList,
        setCurrentVideo,
        currentVideo,
        next
    }
})

export default useCurrentPlayInfo;