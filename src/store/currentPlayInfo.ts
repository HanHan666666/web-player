import {defineStore} from "pinia";
import {ref} from "vue";
import {FileItem} from "@/components/FileList";
import {VideoSupportList} from "@/components/Player";

const useCurrentPlayInfo = defineStore('currentPlayInfo', () => {
    const url = ref<string>();
    const path = ref<string | undefined>();
    const playList = ref<FileItem[]>([]);

    // 下一个视频
    async function next() {
        const index = playList.value.findIndex(item => item.path === path.value);
        if (index === -1) {
            return;
        }
        let nextIndex = (index + 1) % playList.value.length;
        while (true) {
            let fileName = playList.value[nextIndex].fileName
            // 获取文件后缀
            const fileSuffix = fileName.split('.').pop() || "";
            // 如果下一个文件不是视频，就再寻找下一个
            if (!VideoSupportList.includes(fileSuffix)) {
                nextIndex = (nextIndex + 1) % playList.value.length;
                console.log('playList.value[nextIndex]', playList.value[nextIndex])
            } else {
                if (fileName){
                    document.title = fileName;
                }
                // 找到之后就结束循环
                path.value = playList.value[nextIndex].path;
                const fileData = await playList.value[nextIndex]?.fileHandle.getFile();
                url.value = URL.createObjectURL(fileData);
                break;
            }
        }
    }

    return {
        url,
        path,
        playList,
        next
    }
})

export default useCurrentPlayInfo;