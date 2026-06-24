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
  let description = "";
  description += `Read the post titled "${post.data.title}".`;
  description += ` ${terminateSentence(post.data.summary)}`;
  description += ` It was published on ${post.data.date.toLocaleDateString("en-US", { dateStyle: "long" })}.`;
  description += ` It takes about ${getReadingTime(post.body)} minutes to read it.`;
  description += ` It is tagged with ${listing(post.data.tags?.map((tag) => `"${tag}"`) ?? [])}.`;
  return description;
};
