import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'solid',
      autoCodeSplitting: true,
    }),
    solid(),
    tailwindcss(),
    VitePWA({

      includeAssets: ['dentist-svgrepo-com.svg'],
      registerType: 'autoUpdate',
      manifest: {
        name: 'ZahrawiClinic Dental Management App',
        short_name: 'ZahrawiClinic',
        description: 'A dental management app',
        theme_color: '#ffffff',
        "icons": [
          {
            "src": "pwa-64x64.png",
            "sizes": "64x64",
            "type": "image/png"
          },
          {
            "src": "pwa-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "pwa-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          },
          {
            "src": "maskable-icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ]
      }
    })
  ],
})
