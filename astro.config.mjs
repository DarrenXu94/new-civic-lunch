import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify/functions";
import pagefind from "astro-pagefind";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site:
    process.env.NODE_ENV === "development"
      ? "http://example.com"
      : process.env.URL,
  output: "static",
  // adapter: netlify(),

  integrations: [mdx(), sitemap(), pagefind()],
});
