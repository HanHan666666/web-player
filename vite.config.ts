import {defineConfig} from 'vite'
import { fileURLToPath, URL } from "url";
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Icons from "unplugin-icons/vite";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        UnoCSS(),
        Icons({
            compiler: "vue3",
            autoInstall: true
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
})
