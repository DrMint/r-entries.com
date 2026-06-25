import type { CollectionEntry } from "astro:content";
import { getReadingTime } from "./readingTime";

const terminateSentence = (sentence: string): string => {
  return sentence.endsWith(".") ||
    sentence.endsWith("!") ||
    sentence.endsWith("?")
    ? sentence
    : `${sentence}.`;
};

const listing = (items: string[]): string => {
  return items.length > 1
    ? `: ${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]!}`
    : items[0]!;
};

export const getPostDescription = (post: CollectionEntry<"posts">): string => {
  const readingTime = getReadingTime(post.body);

  let description = "";
  description += `Read the post titled "${post.data.title}".`;
  description += ` ${terminateSentence(post.data.summary)}`;
  description += ` It was published on ${post.data.date.toLocaleDateString("en-US", { dateStyle: "long" })}.`;
  description += ` It takes about ${readingTime} minute${readingTime === 1 ? "" : "s"} to read it.`;
  description += ` It is tagged with ${listing(post.data.tags?.map((tag) => `"${tag}"`) ?? [])}.`;
  return description;
};

export const getImageDescription = (
  image: CollectionEntry<"images">
): string => {
  let description = "";
  description += `View the image titled "${image.data.title}".`;
  description += ` It was published on ${image.data.date.toLocaleDateString("en-US", { dateStyle: "long" })}.`;
  description += ` It is tagged with ${listing(image.data.tags?.map((tag) => `"${tag}"`) ?? [])}.`;
  return description;
};

export const getEntriesPageDescription = (
  count: number,
  entityName: { singular: string; plural: string },
  activeTag?: string
): string => {
  let prefix =
    `This page lists all ${entityName.plural}. Optionally, you can filter them by tag.\n`;
  if (activeTag) {
    if (count === 0) {
      return `${prefix}Current you are filtering by tag "${activeTag}", but there are no results.`;
    }
    if (count === 1) {
      return `${prefix}Currently you are viewing the one and only ${entityName.singular} tagged with "${activeTag}".`;
    }
    return `${prefix}Currently you are viewing all ${count} ${entityName.plural} tagged with "${activeTag}".`;
  } else {
    return `${prefix}Currently no tag is selected. All ${count} ${entityName.plural} are listed.`;
  }
};

export const getTagFilterDescription = (
  tag: string,
  count: number | undefined,
  entityName: { singular: string; plural: string },
  isActive: boolean
): string => {
  if (isActive) {
    return `Click to disable filtering and list all ${entityName.plural}.`;
  } else {
    return `List all ${count === undefined ? "" : `${count} `}${(count ?? Infinity) > 1 ? entityName.plural : entityName.singular} tagged with "${tag}".`;
  }
};
