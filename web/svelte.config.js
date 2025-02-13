// @ts-check
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess(), mdsvex()],

  kit: {
    files: {
      // https://stackoverflow.com/questions/71789244/where-to-put-images-with-sveltekit
      assets: "./static",
    },
    alias: {
      "~": "src",
    },
  },

  extensions: [".svelte", ".svx"],
};

// biome-ignore lint/style/noDefaultExport: it's a config file
export default config;
