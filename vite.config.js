import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site at /<repo-name>/, dev server at /
  base: command === 'build' ? '/ai-notes-generator/' : '/',
  plugins: [react()],
}))
