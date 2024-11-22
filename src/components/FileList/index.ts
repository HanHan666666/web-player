import FileList from "./src/FileList.vue";

export interface FileItem extends FileSimpleItem {
    fileHandle: FileSystemFileHandle;
    isVisible: { value: boolean };
    path: string;
}

export interface FileSimpleItem {
    fileName: string;
    isDirectory: boolean;
    /**
     * 视频时长，前端计算
     */
    duration?: number;
}

export {FileList};