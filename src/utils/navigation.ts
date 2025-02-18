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
    if (item.detection === "prefix") {
        return pathname.startsWith(item.href);
    }
    return pathname === item.href;
}
