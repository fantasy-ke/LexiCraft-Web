import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());
  
  // 获取API地址，优先使用环境变量
  const apiBaseUrl = env.VITE_API_BASE_URL || 'https://localhost:7211';
  console.log(`API Base URL: ${apiBaseUrl}`);
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 5272,
      open: true,
      cors: true,
      // 设置为true允许接收任何源的请求
      strictPort: false,
      // 添加代理配置
      proxy: {
        '/api': {
          target: apiBaseUrl, // 使用环境变量或默认值
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false, // 允许无效或自签名证书
          headers: {                  
            Referer: apiBaseUrl
          }
        }
      }
    }
  }
})
