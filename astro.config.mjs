import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://virtualpavi.ca',
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
  }
});
