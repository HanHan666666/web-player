export {};

declare global {
    interface Window {
        showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
    }
}
