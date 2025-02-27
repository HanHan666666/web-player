/// <reference types="vite/client" />

declare module '*.vue' {
    import { DefineComponent } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>
    export default component
}

interface ImportMetaEnv {
    readonly VITE_RUN_MODE: string
    readonly VITE_API_BASE_URL: string
}

declare global {
    interface ImportMeta {
        readonly env: ImportMetaEnv
    }
}
