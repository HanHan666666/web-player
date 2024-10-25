import FileList from "./src/FileList.vue";

export interface FileItem {
    fileHandle: FileSystemFileHandle;
    fileName: string;
    duration?: number;
    isDirectory: boolean;
    isVisible: { value: boolean };
    path: string;
}

export {FileList};