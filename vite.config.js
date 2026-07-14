import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // Production lives at https://www.assignments4u.com/ai-notes-generator/
  base: command === 'build' ? '/ai-notes-generator/' : '/',
  plugins: [react()],
}))
