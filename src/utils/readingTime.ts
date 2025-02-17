export const getReadingTime = (html: string = ""): number => {
  const textOnly = html.replace(/<[^>]+>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = wordCount / 200;
  return Math.ceil(readingTimeMinutes);
};
