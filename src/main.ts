import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router/index.ts'
import i18n from './i18n/index.ts'

const pinia = createPinia()

createApp(App)
.use(pinia)
.use(router)
.use(i18n)
.mount('#app')