import { page } from "$app/state";

export function generateURL(options: { pathname: string }): URL {
  const url = new URL(page.url);
  url.pathname = options.pathname;
  return url;
}
