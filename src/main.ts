import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
// 引入unocss css
import 'virtual:uno.css'
import pinia from "./store";


const app = createApp(App)
app.use(pinia)
app.mount('#app')
