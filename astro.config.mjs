import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://virtualpavi.com',
  output: 'static',

  integrations: [
    sitemap(),
    icon({
      include: {
        lucide: ['*'],
        'simple-icons': ['*']
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },

  adapter: cloudflare()
});