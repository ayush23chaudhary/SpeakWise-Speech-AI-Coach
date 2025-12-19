import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Removed proxy - using direct API calls with CORS instead
    // This is better for OAuth authentication flows
  },
})
