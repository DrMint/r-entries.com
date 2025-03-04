import type { Props } from "astro";

type Icon = ((_props: Props) => any) & ImageMetadata;

export type NavigationItem = {
  href: string;
  detection: "prefix" | "exact";
  label: string;
  icon: Icon;
  tooltip?: string | undefined;
};

export type SocialItem = {
  href: string;
  icon: Icon;
  label: string;
  tooltip: string;
};

export const isActive = (
  item: Pick<NavigationItem, "href" | "detection">,
  pathname: string
) => {
  const fixedPathname =
    process.env.TRAILING_SLASH === "always"
      ? enforceTrailingSlash(pathname)
      : process.env.TRAILING_SLASH === "never"
        ? removeTrailingSlash(pathname)
        : pathname;

  if (item.detection === "prefix") {
    return fixedPathname.startsWith(getUrl(item.href));
  }
  return fixedPathname === getUrl(item.href);
};

const enforceTrailingSlash = (path: string) => {
  return path.endsWith("/") ? path : `${path}/`;
};

const removeTrailingSlash = (path: string) => {
  return path.replace(/\/$/, "");
};

export const getUrl = (path: string, isFile?: boolean) => {
  let url = `${process.env.BASE_PATH}${path}`;
  /* Remove multiple slashes */
  url = url.replace(/\/\/+/g, "/");

  if (process.env.TRAILING_SLASH === "never" || isFile) {
    url = removeTrailingSlash(url);
  } else if (process.env.TRAILING_SLASH === "always") {
    url = enforceTrailingSlash(url);
  }

  /* If nothing is left, return the root */
  if (url === "") {
    return "/";
  }
  return url;
};
