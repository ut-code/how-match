import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// biome-ignore lint/style/noDefaultExport: vite requires this way
export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
});
