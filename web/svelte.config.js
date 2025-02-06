// @ts-check
import staticAdapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess(), mdsvex()],

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: staticAdapter({
      strict: true,
      pages: "dist",
      assets: "dist",
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
