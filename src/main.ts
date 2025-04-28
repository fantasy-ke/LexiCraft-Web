import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import './styles/theme.scss'
import '@/styles/main.scss'
import App from '@/App.vue'
import router from '@/router'
import pinia from '@/store'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(pinia)
app.use(Antd)

app.mount('#app')
