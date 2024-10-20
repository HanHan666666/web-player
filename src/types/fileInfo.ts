
export interface FileItem {
    fileHandle: FileSystemFileHandle;
    fileName: string;
    duration?: number;
    isDirectory: boolean;
    isVisible: {value: boolean};
    path: string;
}
