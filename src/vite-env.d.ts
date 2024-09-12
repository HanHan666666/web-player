/// <reference types="vite/client" />

declare global {
    interface Window {
        showDirectoryPicker: () => Promise<any>;
    }
}
