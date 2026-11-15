// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://buwaneka-portfolio.vercel.app', // TODO: replace with the final domain
  integrations: [react(), mdx()],
  vite: { plugins: [tailwindcss()] },
});
