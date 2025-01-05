import {defineConfig} from 'vite'
import {join, resolve} from 'path'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Icons from "unplugin-icons/vite";
// 当前执行node命令时文件夹的地址(工作目录)
const root = process.cwd()

// 路径查找
function pathResolve(dir: string) {
    return resolve(root, '.', dir)
}

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
    server: {
        proxy: {
            '^/file': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                ws: true
            },
        }
    },
    resolve: {
        alias: {
            '@': join(__dirname, "src"),
        }
    },
    esbuild: {
        pure: ['console.log'], // 删除 console.log
        drop: ['debugger'], // 删除 debugger
    }
})
