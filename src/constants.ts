import HomeIcon from "src/icons/lucide--home.svg";
import PostsIcon from "src/icons/lucide--newspaper.svg";
import TagsIcon from "src/icons/lucide--tags.svg";
import AboutIcon from "src/icons/lucide--circle-user-round.svg";
import GithubLogo from "src/icons/lucide--github.svg";
import TwitterLogo from "src/icons/lucide--twitter.svg";
import Logo from "src/icons/r-entries.svg";
import type { FooterItem, NavigationItem } from "./utils/navigation";

/* ------------------------------[ Constants ]------------------------------- */

export const WEBSITE_NAME = "ReSTRICTed_Entries";
export const WebsiteLogo = Logo;

export const DEFAULT_TITLE = "R-Entries";
export const DEFAULT_DESCRIPTION = "A collection of entries about R";
export const DEFAULT_THUMBNAIL = "/default-thumbnail.jpg";

export const FOREGROUND_COLOR = "CanvasText";
export const BACKGROUND_COLOR = "Canvas";

/* -------------------------------[ Features ]------------------------------- */

export const ENABLE_GO_TO_TOP_FEATURE = true;
export const ENABLE_TABLE_OF_CONTENTS_FEATURE = true;
export const ENABLE_IMAGE_ZOOM_FEATURE = true;

/* ------------------------------[ Navigation ]------------------------------ */

export const NAVIGATION_HOME_ITEM: NavigationItem = {
    href: "/",
    detection: "exact",
    label: "Home",
    icon: HomeIcon,
    tooltip: "Go to home page"
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        href: "/posts",
        detection: "prefix",
        label: "Posts",
        icon: PostsIcon,
    },
    {
        href: "/tags",
        detection: "prefix",
        label: "Tags",
        icon: TagsIcon,
    },
    {
        href: "/about",
        detection: "prefix",
        label: "About",
        icon: AboutIcon,
    },
];

export const FOOTER_ITEMS: FooterItem[] = [
    {
        href: "https://x.com/DrMint4",
        icon: TwitterLogo,
        label: "Twitter",
        tooltip: "My Twitter profile"
    },
    {
        href: "https://github.com/DrMint",
        icon: GithubLogo,
        label: "GitHub",
        tooltip: "My GitHub profile"
    }
];

