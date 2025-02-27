import { page } from "$app/state";

export function generateURL({
  pathname = "",
  password = "",
  username = "",
  search = "",
}: {
  pathname?: string;
  password?: string;
  username?: string;
  search?: string;
}) {
  const url = new URL(page.url.href);
  url.password = password;
  url.username = username;
  url.pathname = pathname;
  url.search = search;
  return url;
}
