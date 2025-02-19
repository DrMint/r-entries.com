/* ---------------------------------[ Types ]-------------------------------- */

import type { Props } from "astro";

type Icon = ((_props: Props) => any) & ImageMetadata;

export type NavigationItem = {
    href: string;
    detection: "prefix" | "exact";
    label: string;
    icon: Icon;
    tooltip?: string | undefined;
}

export type FooterItem = {
    href: string;
    icon: Icon;
    label: string;
    tooltip: string;
}

export const isActive = (item: Pick<NavigationItem, "href" | "detection">, pathname: string) => {
    const pathnameWithoutTrailingSlash = removeTrailingSlash(pathname);

    if (item.detection === "prefix") {
        return pathnameWithoutTrailingSlash.startsWith(getUrl(item.href));
    }
    return pathnameWithoutTrailingSlash === getUrl(item.href);
}

const removeTrailingSlash = (path: string) => {
    return path.replace(/\/$/, "");
}

export const getUrl = (path: string) => {
    let url = `${import.meta.env.BASE_URL}${path}`;
    /* Remove multiple slashes */
    url = url.replace(/\/\/+/g, "/");
    url = removeTrailingSlash(url);
    /* If nothing is left, return the root */
    if (url === "") {
        return "/";
    }
    return url;
}