import {request, RequestEnum} from "@/config/axios";
import {FileSimpleItem} from "@/components/FileList";


export const FILE_PREFIX = '/file'

export function GetFileList(data: any): Promise<FileSimpleItem[]> {
    return new Promise((resolve) => {
        request(RequestEnum.GET, FILE_PREFIX + '/' + data, null)
            .then((res) => {
                resolve(res)
            })
    })
}

export function getFile(data: string) {
    window.open(FILE_PREFIX + data, '_blank');
}