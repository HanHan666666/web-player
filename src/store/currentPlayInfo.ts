import {defineStore} from "pinia";
import {ref} from "vue";
import {FileItem} from "../types/fileInfo.ts";

const useCurrentPlayInfo = defineStore('currentPlayInfo', () => {
    const url = ref<string>();
    const fileItem = ref<FileItem>();
    function setFileItem(item:FileItem){
        fileItem.value.isVisible.value = false
        item.isVisible.value = true
        fileItem.value = item
    }
    return {
        url,
        fileItem,
        setFileItem
    }
})

export default useCurrentPlayInfo;