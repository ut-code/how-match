// @ts-check
import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess(), mdsvex()],

  kit: {
    adapter: adapter({
      // See below for an explanation of these options
      routes: {
        include: ["/*"],
        exclude: ["<all>"],
      },
      // platformProxy: {
      // 	configPath: 'wrangler.toml',
      // 	environment: undefined,
      // 	experimentalJsonConfig: false,
      // 	persist: false
      // }
    }),
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
