import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify/functions";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://main--vermillion-custard-f525f4.netlify.app/",
  output: "server",
  adapter: netlify(),

  integrations: [mdx(), sitemap()],
});
