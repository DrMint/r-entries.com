import HomeIcon from "src/icons/lucide--home.svg";
import PostsIcon from "src/icons/lucide--newspaper.svg";
import AboutIcon from "src/icons/lucide--circle-user-round.svg";
import GithubLogo from "src/icons/lucide--github.svg";
import TwitterLogo from "src/icons/lucide--twitter.svg";
import ImageIcon from "src/icons/lucide--image.svg";
import Logo from "src/icons/r-entries.svg";
import type { SocialItem, NavigationItem } from "src/utils/navigation";

export type ResponsiveWidth = (typeof RESPONSIVE_WIDTHS)[number];

/* ------------------------------[ Constants ]------------------------------- */

export const WEBSITE_NAME = "ReSTRICTed_Entries";
export const WebsiteLogo = Logo;
export const TWITTER_HANDLE: string | undefined = "@DrMint4";

export const DEFAULT_TITLE = "R-Entries";
export const DEFAULT_DESCRIPTION = "A collection of entries about R";
export const WEBSITE_COPYRIGHT_STARTING_YEAR = 2018;
export const WEBSITE_COPYRIGHT_NAME = "R-Entries";

// Set it to `Infinity` to show all posts on the homepage
// and disable the "view all posts" button and Posts page
export const MAX_POSTS_HOMEPAGE = 6;

// Set all values to `Infinity` to show all images on the homepage
// and disable the "view all images" button and Images page
export const MAX_IMAGES_HOMEPAGE: {
  with4Columns: number;
  with3Columns: number;
  with2Columns: number;
  with1Column: number;
} = {
  with4Columns: 4,
  with3Columns: 6,
  with2Columns: 6,
  with1Column: 4,
};

/* -------------------------------[ Features ]------------------------------- */

// Set to `true` to enable the "go to top" button on all pages.
// The user has to scroll down a bit before the button appears.
export const ENABLE_GO_TO_TOP_FEATURE = true;
// Set to `true` to enable the table of contents at the top of posts.
export const ENABLE_TABLE_OF_CONTENTS_FEATURE = true;
// Set to `true` to enable the image zoom feature
// The zoom is triggered by clicking on the image,
// and the image would actually be larger when opened in a lightbox.
export const ENABLE_IMAGE_ZOOM_FEATURE = true;
// Set to `true` to display tags on post and image cards,
// on their entries pages and respective pages.
export const ENABLE_TAG_FEATURE = true;

/* ------------------------------[ Responsive ]------------------------------ */

export const RESPONSIVE_WIDTHS = [
  256, 320, 440, 580, 760, 1024, 1440, 1920, 2560, 3200,
] as const;
export const OPEN_GRAPH_WIDTH: ResponsiveWidth = 1024;

/* ------------------------------[ Navigation ]------------------------------ */

export const NAVIGATION_HOME_ITEM: NavigationItem = {
  href: "/",
  detection: "exact",
  label: "Home",
  icon: HomeIcon,
  tooltip: "Go to home page",
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  ...(MAX_POSTS_HOMEPAGE === Infinity
    ? []
    : [
        {
          href: "/posts",
          detection: "prefix" as const,
          label: "Posts",
          icon: PostsIcon,
        },
      ]),
  ...(Math.min(...Object.values(MAX_IMAGES_HOMEPAGE)) === Infinity
    ? []
    : [
        {
          href: "/images",
          detection: "prefix" as const,
          label: "Images",
          icon: ImageIcon,
        },
      ]),
  {
    href: "/about",
    detection: "prefix",
    label: "About",
    icon: AboutIcon,
  },
];

export const SOCIAL_ITEMS: SocialItem[] = [
  {
    href: "https://x.com/DrMint4",
    icon: TwitterLogo,
    label: "Twitter",
    tooltip: "My Twitter profile",
  },
  {
    href: "https://github.com/DrMint",
    icon: GithubLogo,
    label: "GitHub",
    tooltip: "My GitHub profile",
  },
];
