import {defineStore} from "pinia";
import {ref} from "vue";
import {FileItem} from "@/components/FileList";

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
        const nextIndex = (index + 1) % playList.value.length;
        path.value = playList.value[nextIndex].path;
        const fileData = await playList.value[nextIndex]?.fileHandle.getFile();
        url.value = URL.createObjectURL(fileData);
    }
    return {
        url,
        path,
        playList,
        next
    }
})

export default useCurrentPlayInfo;