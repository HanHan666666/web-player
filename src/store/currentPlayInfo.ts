import {defineStore} from "pinia";
import {ref} from "vue";

const useCurrentPlayInfo = defineStore('currentPlayInfo', () => {
    const url = ref<string>();
    const path = ref<string | undefined>();
    return {
        url,
        path
    }
})

export default useCurrentPlayInfo;